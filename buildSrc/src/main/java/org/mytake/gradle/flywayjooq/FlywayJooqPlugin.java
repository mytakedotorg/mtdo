package org.mytake.gradle.flywayjooq;

import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.gradle.api.Action;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.plugins.JavaBasePlugin;
import org.gradle.api.plugins.JavaPlugin;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskProvider;
import org.jooq.codegen.DefaultGeneratorStrategy;
import org.jooq.codegen.JavaGenerator;
import org.jooq.meta.jaxb.Database;
import org.jooq.meta.jaxb.ForcedType;
import org.jooq.meta.jaxb.Generate;
import org.jooq.meta.jaxb.Generator;
import org.jooq.meta.jaxb.Strategy;
import org.jooq.meta.jaxb.Target;
import org.jooq.meta.postgres.PostgresDatabase;

import com.diffplug.common.base.Errors;

/**
 * This plugin spools up a fresh postgres session,
 * runs flyway on it, then runs jooq on the result.
 * The postgres stays up so that the flyway result
 * can be used as a template database for testing.
 */
public class FlywayJooqPlugin implements Plugin<Project> {
	private static final String EXTENSION_NAME = "flywayJooq";

	public static class Extension {
		public final SetupCleanupDockerFlyway setup = new SetupCleanupDockerFlyway();

		private final Generator generator;
		private final List<ForcedType> forcedTypes;
		{
			generator = new Generator();
			generator.setStrategy(new Strategy());

			Database database = new Database();
			forcedTypes = new ArrayList<>();
			database.setForcedTypes(forcedTypes);
			generator.setDatabase(database);
			generator.setGenerate(new Generate());
			generator.setTarget(new Target());

			generator.setName(JavaGenerator.class.getName());
			generator.getStrategy().setName(DefaultGeneratorStrategy.class.getName());
			generator.getDatabase().setName(PostgresDatabase.class.getName());
		}

		public void generator(Action<Generator> generatorConfig) {
			generatorConfig.execute(generator);
		}

		public void forcedType(Action<ForcedType> forcedConfig) {
			ForcedType forced = new ForcedType();
			forcedConfig.execute(forced);
			forcedTypes.add(forced);
		}

		/** Ensures a database with a template prepared by Flyway is available. */
		public void neededBy(TaskProvider<?> taskProvider) {
			taskProvider.configure(this::neededBy);
		}

		/** Ensures a database with a template prepared by Flyway is available. */
		public void neededBy(Task task) {
			tasksFqn.add(task.getPath());
			task.getInputs().file(setup.dockerComposeFile).withPathSensitivity(PathSensitivity.RELATIVE);
			task.getInputs().dir(setup.flywayMigrations).withPathSensitivity(PathSensitivity.RELATIVE);
		}

		private Set<String> tasksFqn = new HashSet<>();
	}

	@Override
	public void apply(Project project) {
		// FlywayPlugin needs to be applied first
		project.getPlugins().apply(JavaBasePlugin.class);

		Extension extension = project.getExtensions().create(EXTENSION_NAME, Extension.class);
		extension.setup.dockerPullOnStartup = !project.getGradle().getStartParameter().isOffline();

		// force all jooq versions to match
		String jooqVersion = detectJooqVersion();
		project.getConfigurations().all(config -> {
			config.resolutionStrategy(strategy -> {
				strategy.eachDependency(details -> {
					String group = details.getRequested().getGroup();
					String name = details.getRequested().getName();
					if (group.equals("org.jooq") && name.startsWith("jooq")) {
						details.useTarget(group + ":" + name + ":" + jooqVersion);
					}
				});
			});
		});

		// create a jooq task, which will be needed by all compilation tasks
		TaskProvider<JooqTask> jooqTask = project.getTasks().register("jooq", JooqTask.class, task -> {
			task.setup = extension.setup;
			task.generatorConfig = extension.generator;
		});
		extension.neededBy(jooqTask);
		project.getTasks().named(JavaPlugin.COMPILE_JAVA_TASK_NAME).configure(task -> {
			task.dependsOn(jooqTask);
		});

		project.getTasks().register(DOCKER_DOWN);
		project.getGradle().getTaskGraph().whenReady(graph -> {
			// dockerDown runs before everything else
			if (graph.hasTask(project.getPath() + ":" + DOCKER_DOWN)) {
				Errors.rethrow().run(() -> {
					extension.setup.forceStop(project);
				});
			}
			// doFirst workaround, so that any task that needs a populated db gets one
			AtomicBoolean hasStarted = new AtomicBoolean(false);
			graph.beforeTask(task -> {
				if (task.getEnabled() && extension.tasksFqn.contains(task.getPath()) && hasStarted.compareAndSet(false, true)) {
					Errors.rethrow().run(() -> {
						extension.setup.start(project);
					});
				}
			});
		});
	}

	private static final String DOCKER_DOWN = "dockerDown";

	/** Detects the jooq version. */
	private static String detectJooqVersion() {
		URLClassLoader loader = (URLClassLoader) FlywayJooqPlugin.class.getClassLoader();
		for (URL url : loader.getURLs()) {
			Pattern pattern = Pattern.compile("(.*)/jooq-([0-9,.]*?).jar$");
			Matcher matcher = pattern.matcher(url.getPath());
			if (matcher.matches()) {
				return matcher.group(2);
			}
		}
		throw new IllegalStateException("Unable to detect jooq version.");
	}
}
