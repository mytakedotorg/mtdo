/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Files;
import com.google.inject.Binder;
import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.configuration.ProjectName;
import com.palantir.docker.compose.execution.DockerComposeExecArgument;
import com.palantir.docker.compose.execution.DockerComposeExecOption;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.io.File;
import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import org.jooby.Env;
import org.jooby.Jooby;

class CleanPostgresModule implements Jooby.Module {
	private static final String USER = "postgres";

	private final String randomDbName;

	{
		// create a random database name
		randomDbName = Integer.toString(Math.abs((int) (Math.random() * 1e9)));
		// create the database
		dockerPostgresExec("createdb", "-U", USER, randomDbName);
	}

	void dockerPostgresExec(String... args) {
		File dockerComposeFile = new File("src/test/resources/docker-compose.yml");
		DockerComposeRule rule = DockerComposeRule.builder()
				.file(dockerComposeFile.getAbsolutePath())
				.projectName(ProjectName.fromString(Integer.toString(Math.abs(dockerComposeFile.getAbsolutePath().hashCode()))))
				.build();
		Errors.rethrow().run(() -> {
			rule.dockerCompose().exec(DockerComposeExecOption.noOptions(), USER, DockerComposeExecArgument.arguments(args));
		});
	}

	private void delete() {
		dockerPostgresExec("dropdb", "-U", USER, randomDbName);
	}

	@Override
	public Config config() {
		// connect to it
		String jdbcUrl;
		{
			Properties connectionProps = new Properties();
			File connectionFile = new File("build/pgConnection.properties");
			try (Reader reader = Files.asCharSource(connectionFile, StandardCharsets.UTF_8).openBufferedStream()) {
				connectionProps.load(reader);
			} catch (IOException e) {
				throw Errors.asRuntime(e);
			}
			String ip = connectionProps.getProperty("host");
			int port = Integer.parseInt(connectionProps.getProperty("port"));
			jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", ip, port, randomDbName);
		}

		Map<String, String> map = new HashMap<>();
		map.put("db.url", jdbcUrl);
		map.put("db.user", USER);
		map.put("db.password", "");
		return ConfigFactory.parseMap(map);
	}

	@Override
	public void configure(Env env, Config conf, Binder binder) {
		env.onStarted(() -> {
			env.onStop(this::delete);
		});
	}
}
