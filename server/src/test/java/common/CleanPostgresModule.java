/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
package common;

import com.diffplug.common.base.Errors;
import com.google.common.collect.ImmutableList;
import com.google.common.io.Files;
import com.google.inject.Binder;
import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.configuration.ProjectName;
import com.palantir.docker.compose.execution.DockerComposeExecArgument;
import com.palantir.docker.compose.execution.DockerComposeExecOption;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.io.Reader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import javax.annotation.Nullable;
import org.jooby.Env;
import org.jooby.Jooby;

final class CleanPostgresModule implements Jooby.Module {
	private static final String USER = "root";

	private final String randomDbName;
	private boolean isLoadedFromBackup;

	private CleanPostgresModule(@Nullable String backupFile) {
		// create a random database name
		randomDbName = Integer.toString(Math.abs((int) (Math.random() * 1e9)));
		isLoadedFromBackup = backupFile != null;
		if (isLoadedFromBackup) {
			exec("createdb", "-U", USER, "-T", "template0", randomDbName);
			exec("pg_restore", "--no-owner", "-d", randomDbName, backupFile);
			// in config, we will call flyway to migrate the database
		} else {
			exec("createdb", "-U", USER, randomDbName);
		}
	}

	static CleanPostgresModule prePopulatedSchema() {
		return new CleanPostgresModule(null);
	}

	static CleanPostgresModule loadFromBackup(String backup) {
		return new CleanPostgresModule(Objects.requireNonNull(backup));
	}

	void exec(String... args) {
		try {
			if (CircleCi.isCircle()) {
				List<String> argsCopy = new ArrayList<>(Arrays.asList(args));
				argsCopy.add(1, "-h");
				argsCopy.add(2, "localhost");
				argsCopy.add(3, "-p");
				argsCopy.add(4, "5432");
				Process process = Runtime.getRuntime().exec(argsCopy.toArray(new String[0]));
				InputStreamCollector input = new InputStreamCollector(process.getInputStream(), System.out);
				InputStreamCollector error = new InputStreamCollector(process.getErrorStream(), System.err);
				process.waitFor(10, TimeUnit.SECONDS);
				input.join(1_000);
				error.join(1_000);
			} else {
				File dockerComposeFile = new File("src/test/resources/docker-compose.yml");
				DockerComposeRule rule = DockerComposeRule.builder()
						.file(dockerComposeFile.getAbsolutePath())
						.projectName(ProjectName.fromString(Integer.toString(Math.abs(dockerComposeFile.getAbsolutePath().hashCode()))))
						.build();
				String result = rule.dockerCompose().exec(DockerComposeExecOption.noOptions(), "postgres", DockerComposeExecArgument.arguments(args));
				System.out.println(result);
			}
		} catch (IOException | InterruptedException e) {
			throw Errors.asRuntime(e);
		}
	}

	public void pgDump(String archiveName) {
		exec("pg_dump", "--format=custom", "-f", "/Downloads/" + archiveName, randomDbName);
	}

	private void delete() {
		exec("dropdb", "-U", USER, randomDbName);
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
		if (isLoadedFromBackup) {
			env.onStart(Prod::flywayMigrate);
		}
		env.onStarted(() -> {
			env.onStop(this::delete);
		});
	}

	static class InputStreamCollector extends Thread {
		private final InputStream iStream;
		@Nullable
		private final PrintStream pStream;

		private final ImmutableList.Builder<String> output;

		private IOException exception;

		public InputStreamCollector(InputStream is, @Nullable PrintStream ps) {
			this.iStream = Objects.requireNonNull(is);
			this.pStream = ps;
			this.output = ImmutableList.builder();
			start();
		}

		@Override
		public synchronized void run() {
			try (BufferedReader reader = new BufferedReader(new InputStreamReader(iStream, Charset.defaultCharset()))) {
				String line;
				while ((line = reader.readLine()) != null) {
					output.add(line);
					if (pStream != null) {
						pStream.println(line);
					}
				}
				pStream.flush();
			} catch (IOException ex) {
				this.exception = ex;
			}
		}

		public synchronized ImmutableList<String> getOutput() {
			return output.build();
		}

		public synchronized IOException getException() {
			return exception;
		}
	}
}
