package org.mytake.gradle.flywayjooq;

import java.io.File;
import java.nio.file.Files;

import org.gradle.api.DefaultTask;
import org.gradle.api.tasks.TaskAction;

import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.configuration.ProjectName;
import com.palantir.docker.compose.configuration.ShutdownStrategy;
import com.palantir.docker.compose.connection.DockerPort;
import com.palantir.docker.compose.connection.waiting.HealthChecks;

class DockerPg {
	public static DockerComposeRule createRule(File dockerComposeFile) {
		return DockerComposeRule.builder()
				.file(dockerComposeFile.getAbsolutePath())
				.projectName(ProjectName.fromString(Integer.toString(Math.abs(dockerComposeFile.getAbsolutePath().hashCode()))))
				.waitingForService("postgres", HealthChecks.toHaveAllPortsOpen())
				.pullOnStartup(true)
				.removeConflictingContainersOnStartup(true)
				.saveLogsTo("build/tmp/docker")
				.shutdownStrategy(ShutdownStrategy.SKIP)
				.build();
	}

	/** Extracts a DockerPort from a rule which has already had `before()` called. */
	public static DockerPort postgresPort(DockerComposeRule rule) {
		return rule.containers()
				.container("postgres")
				.port(5432);
	}

	public static class DownTask extends DefaultTask {
		File dockerComposeFile;
		File connectionParams;

		@TaskAction
		public void down() throws Exception {
			DockerPg.createRule(dockerComposeFile).dockerCompose().down();
			Files.deleteIfExists(connectionParams.toPath());
		}
	}
}
