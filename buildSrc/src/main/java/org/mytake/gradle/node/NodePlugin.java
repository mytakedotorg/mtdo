package org.mytake.gradle.node;

import java.util.Collections;
import java.util.Objects;

import org.gradle.api.Action;
import org.gradle.api.DefaultTask;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;
import org.gradle.api.tasks.TaskProvider;

import com.github.eirslett.maven.plugins.frontend.lib.ProxyConfig;

/**
 * Installs a specific version of node.js and npm,
 * Runs 'npm ci' to install the packages, and then `gulp blah`
 * to run whatever gulp tasks you want.
 */
public class NodePlugin implements Plugin<Project> {
	private static final String EXTENSION_NAME = "node";

	public static class Extension {
		private final Project project;

		public Extension(Project project) {
			this.project = Objects.requireNonNull(project);
		}

		public final SetupCleanupNode setup = new SetupCleanupNode();

		public TaskProvider<?> gulp(String name, Action<Task> taskConfig) {
			return project.getTasks().register("gulp_" + name, GulpTask.class, task -> {
				task.taskName = name;
				task.getInputs().file("package-lock.json").withPathSensitivity(PathSensitivity.RELATIVE);
				task.getInputs().file("gulpfile.js").withPathSensitivity(PathSensitivity.RELATIVE);
				task.getInputs().property("nodeVersion", setup.nodeVersion);
				task.getInputs().property("npmVersion", setup.npmVersion);
				taskConfig.execute(task);
			});
		}

		public TaskProvider<?> npmRun(String name, Action<Task> taskConfig) {
			return project.getTasks().register("npm_run_" + name, NpmRunTask.class, task -> {
				task.taskName = name;
				task.getInputs().file("package-lock.json").withPathSensitivity(PathSensitivity.RELATIVE);
				task.getInputs().property("nodeVersion", setup.nodeVersion);
				task.getInputs().property("npmVersion", setup.npmVersion);
				taskConfig.execute(task);
			});
		}
	}

	@CacheableTask
	public abstract static class GulpTask extends DefaultTask {
		public String taskName;

		@Input
		public String getTaskName() {
			return taskName;
		}

		@TaskAction
		public void npmCiGulpTask() throws Exception {
			SetupCleanupNode setup = getProject().getPlugins().apply(NodePlugin.class).extension.setup;
			// install node, npm, and package-lock.json
			setup.start(getProject());
			// run the gulp tas
			ProxyConfig proxyConfig = new ProxyConfig(Collections.emptyList());
			setup.factory().getNpxRunner(proxyConfig, null)
			.execute("gulp " + taskName, null);
		}
	}

	@CacheableTask
	public abstract static class NpmRunTask extends DefaultTask {
		public String taskName;

		@Input
		public String getTaskName() {
			return taskName;
		}

		@TaskAction
		public void npmRunTask() throws Exception {
			SetupCleanupNode setup = getProject().getPlugins().apply(NodePlugin.class).extension.setup;
			// install node, npm, and package-lock.json
			setup.start(getProject());
			// run the gulp task
			ProxyConfig proxyConfig = new ProxyConfig(Collections.emptyList());
			setup.factory().getNpmRunner(proxyConfig, null)
			.execute("run " + taskName, null);
		}
	}

	@Override
	public void apply(Project project) {
		extension = project.getExtensions().create(EXTENSION_NAME, Extension.class, project);
	}

	private Extension extension;
}

