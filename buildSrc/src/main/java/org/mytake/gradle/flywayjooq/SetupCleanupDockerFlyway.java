package org.mytake.gradle.flywayjooq;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Properties;
import java.util.TreeMap;
import java.util.concurrent.TimeUnit;

import org.flywaydb.core.Flyway;
import org.gradle.api.Project;
import org.postgresql.ds.PGSimpleDataSource;

import com.diffplug.common.base.Either;
import com.diffplug.common.base.Errors;
import com.google.common.collect.ImmutableList;
import com.google.common.io.ByteStreams;
import com.google.common.io.Files;
import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.configuration.ProjectName;
import com.palantir.docker.compose.configuration.ShutdownStrategy;
import com.palantir.docker.compose.connection.DockerPort;
import com.palantir.docker.compose.connection.waiting.HealthChecks;
import com.palantir.docker.compose.execution.DockerCompose;
import com.palantir.docker.compose.execution.DockerComposeExecArgument;
import com.palantir.docker.compose.execution.DockerComposeExecOption;

import buildsrc.Env;
import buildsrc.SetupCleanup;

public class SetupCleanupDockerFlyway implements Serializable {
	private static final long serialVersionUID = -8606504827780656288L;

	private static final String CIRCLECI_IP = "localhost";
	private static final int CIRCLECI_PORT = 5432;

	public File dockerComposeFile;
	public File dockerConnectionParams;
	public transient boolean dockerPullOnStartup = true; 

	public transient File flywayMigrations;
	public transient File flywaySchemaDump;
	private TreeMap<String, byte[]> flywaySnapshot;

	/** Saves the flywayMigrations, then starts docker (if necessary) and runs flyway. */
	void start(Project project) throws Exception {
		flywaySnapshot = new TreeMap<>();
		Path root = flywayMigrations.toPath();
		java.nio.file.Files.walkFileTree(root, new SimpleFileVisitor<Path>() {
			@Override
			public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
				String path = root.relativize(file).toString();
				flywaySnapshot.put(path, java.nio.file.Files.readAllBytes(file));
				return FileVisitResult.CONTINUE;
			}
		});
		new Impl().start(keyFile(project), this);
	}

	void forceStop(Project project) throws Exception {
		new Impl().forceStop(keyFile(project), this);
	}

	PGSimpleDataSource getConnection() throws IOException {
		String ip;
		int port;
		if (Env.isCircleCI()) {
			ip = CIRCLECI_IP;
			port = CIRCLECI_PORT;
		} else {
			// read the connection properties 
			Properties connectionProps = new Properties();
			try (Reader reader = Files.asCharSource(dockerConnectionParams, StandardCharsets.UTF_8).openBufferedStream()) {
				connectionProps.load(reader);
			} catch (IOException e) {
				throw Errors.asRuntime(e);
			}
			ip = connectionProps.getProperty("host");
			port = Integer.parseInt(connectionProps.getProperty("port"));
		}
		PGSimpleDataSource dataSource = new PGSimpleDataSource();
		dataSource.setServerNames(new String[] {ip});
		dataSource.setPortNumbers(new int[] {port});
		dataSource.setUser("root");
		dataSource.setDatabaseName("template1");
		dataSource.setConnectTimeout(20);
		return dataSource;
	}

	private static File keyFile(Project project) {
		return new File(project.getBuildDir(), "docker");
	}

	DockerComposeRule rule() {
		return DockerComposeRule.builder()
				.file(dockerComposeFile.getAbsolutePath())
				.projectName(ProjectName.fromString(Integer.toString(Math.abs(dockerComposeFile.getAbsolutePath().hashCode()))))
				.waitingForService("postgres", HealthChecks.toHaveAllPortsOpen())
				.pullOnStartup(dockerPullOnStartup)
				.removeConflictingContainersOnStartup(true)
				.saveLogsTo("build/tmp/docker")
				.shutdownStrategy(ShutdownStrategy.SKIP)
				.build();
	}

	private static class Impl extends SetupCleanup<SetupCleanupDockerFlyway> {
		@Override
		protected void doStart(SetupCleanupDockerFlyway key) throws IOException, InterruptedException {
			DockerComposeRule rule;
			String ip;
			int port;
			if (Env.isCircleCI()) {
				// circle provides the container for us
				rule = null;
				ip = CIRCLECI_IP;
				port = CIRCLECI_PORT;
			} else {
				// start docker-compose and get postgres from that
				rule = key.rule();
				rule.before();
				Files.createParentDirs(key.dockerConnectionParams);

				DockerPort dockerPort = rule.containers()
						.container("postgres")
						.port(5432);
				ip = dockerPort.getIp();
				port = dockerPort.getExternalPort();
			}
			Files.createParentDirs(key.dockerConnectionParams);
			Files.asCharSink(key.dockerConnectionParams, StandardCharsets.UTF_8).write("host=" + ip + "\nport=" + port);

			// run flyway
			PGSimpleDataSource postgres = key.getConnection();
			Flyway.configure()
			.dataSource(postgres)
			.locations("filesystem:" + key.flywayMigrations.getAbsolutePath())
			.schemas("public")
			.load()
			.migrate();

			// write out the schema to disk
			String schema;
			List<String> pg_dump_args = Arrays.asList("-d", "template1", "-U", postgres.getUser(), "--schema-only");
			if (rule == null) {
				Process process = Runtime.getRuntime().exec(ImmutableList.<String>builder().add(
						"pg_dump", 
						"-h", CIRCLECI_IP, "-p", Integer.toString(CIRCLECI_PORT))
						.addAll(pg_dump_args).build().toArray(new String[0]));
				// swallow errors (not great...)
				new InputStreamCollector(process.getErrorStream());
				InputStreamCollector output = new InputStreamCollector(process.getInputStream());
				process.waitFor(10, TimeUnit.SECONDS);
				output.join(1_000);
				schema = new String(output.result().getLeft(), StandardCharsets.UTF_8);
			} else {
				schema = rule.dockerCompose().exec(DockerComposeExecOption.noOptions(),
						"postgres", DockerComposeExecArgument.arguments(ImmutableList.builder().add("pg_dump")
								.addAll(pg_dump_args).build().toArray(new String[0])));
			}
			Files.createParentDirs(key.flywaySchemaDump);
			Files.write(schema, key.flywaySchemaDump, StandardCharsets.UTF_8);
		}

		@Override
		protected void doStop(SetupCleanupDockerFlyway key) throws IOException, InterruptedException {
			if (!Env.isCircleCI()) {
				DockerCompose compose = key.rule().dockerCompose();
				compose.kill();
				compose.rm();
			}
		}

		static class InputStreamCollector extends Thread {
			private final InputStream iStream;
			private Either<byte[], IOException> result;

			public InputStreamCollector(InputStream is) {
				this.iStream = Objects.requireNonNull(is);
				start();
			}

			@Override
			public synchronized void run() {
				try {
					ByteArrayOutputStream output = new ByteArrayOutputStream();
					ByteStreams.copy(iStream, output);
					result = Either.createLeft(output.toByteArray());
				} catch (IOException ex) {
					result = Either.createRight(ex);
				}
			}

			public synchronized Either<byte[], IOException> result() {
				return result;
			}
		}
	}
}
