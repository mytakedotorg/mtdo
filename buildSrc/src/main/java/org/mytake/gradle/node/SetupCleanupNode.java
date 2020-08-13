package org.mytake.gradle.node;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;

import org.gradle.api.Project;

import com.github.eirslett.maven.plugins.frontend.lib.FrontendPluginFactory;
import com.github.eirslett.maven.plugins.frontend.lib.InstallationException;
import com.github.eirslett.maven.plugins.frontend.lib.ProxyConfig;
import com.github.eirslett.maven.plugins.frontend.lib.TaskRunnerException;

import buildsrc.SetupCleanup;

public class SetupCleanupNode implements Serializable {
	private static final long serialVersionUID = 1530999909735922493L;

	public String nodeVersion;
	public String npmVersion;
	private File workingDir, installDir;
	@SuppressWarnings("unused") // used for serialized equality
	private byte[] packageLockJson;

	public void start(Project project) throws Exception {
		workingDir = project.getProjectDir();
		installDir = new File(project.getRootProject().getBuildDir(), "node-install");
		packageLockJson = Files.readAllBytes(workingDir.toPath().resolve("package-lock.json"));
		new Impl().start(keyFile(project), this);
	}

	FrontendPluginFactory factory() {
		return new FrontendPluginFactory(workingDir, installDir);
	}

	public Path nodePath() {
		return installDir.toPath().resolve("node/node");
	}

	private static File keyFile(Project project) {
		return new File(project.getBuildDir(), "node_modules/.gradle-state");
	}

	private static class Impl extends SetupCleanup<SetupCleanupNode> {
		@Override
		protected void doStart(SetupCleanupNode key) throws TaskRunnerException, InstallationException {
			ProxyConfig proxyConfig = new ProxyConfig(Collections.emptyList());
			FrontendPluginFactory factory = key.factory();
			factory.getNodeInstaller(proxyConfig)
			.setNodeVersion(key.nodeVersion)
			.setNpmVersion(key.npmVersion)
			.install();
			factory.getNpmRunner(proxyConfig, null)
				.execute("ci", null);
		}

		@Override
		protected void doStop(SetupCleanupNode key) throws IOException, InterruptedException {
		}
	}
}
