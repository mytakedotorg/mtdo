package org.mytake.gradle.flywayjooq;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.gradle.api.Action;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.artifacts.Configuration;
import org.gradle.api.plugins.JavaBasePlugin;
import org.gradle.api.tasks.compile.JavaCompile;
import org.jooq.util.DefaultGeneratorStrategy;
import org.jooq.util.JavaGenerator;
import org.jooq.util.jaxb.Database;
import org.jooq.util.jaxb.ForcedType;
import org.jooq.util.jaxb.Generate;
import org.jooq.util.jaxb.Generator;
import org.jooq.util.jaxb.Strategy;
import org.jooq.util.jaxb.Target;
import org.jooq.util.postgres.PostgresDatabase;

/**
 * This plugin must be applied after 'org.flywaydb.flyway' and 'nu.studer.jooq'.
 * 
 * It creates a task called 'h2flywayInit', which will run all of the migration
 * scripts defined by Flyway against an in-memory H2 database, and it will write
 * out the resultant schema to '$buildDir/h2flyway-init.sql'.
 * 
 * It also sets up the jOOQ task so that it will generate code based on the result
 * of this h2 migration (not working yet).
 */
public class EmbeddedPgPlugin implements Plugin<Project> {
	private static final String EXTENSION_NAME = "flywayJooqEmbeddedPg";

	public static class Extension {
		public File templateDb;
		public File migrations;

		private Generator generator;
		private List<ForcedType> forcedTypes;
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
	}

	private static final String JOOQ_RUNTIME = "jooqRuntime";

	@Override
	public void apply(Project project) {
		// FlywayPlugin needs to be applied first
		project.getPlugins().apply(JavaBasePlugin.class);

		Extension extension = project.getExtensions().create(EXTENSION_NAME, Extension.class);

		// create jooqRuntime
		Configuration jooqRuntime = project.getConfigurations().create(JOOQ_RUNTIME);
		jooqRuntime.setDescription("The classpath used to invoke the jOOQ generator.");
		project.getDependencies().add(JOOQ_RUNTIME, "org.jooq:jooq-codegen");

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
		EmbeddedPgTask jooqTask = project.getTasks().create("jooq", EmbeddedPgTask.class);
		project.getTasks().withType(JavaCompile.class).all(task -> task.dependsOn(jooqTask));

		project.afterEvaluate(unused -> {
			jooqTask.flywayMigrations = extension.migrations;
			jooqTask.generatorConfig = extension.generator;
			jooqTask.jooqClasspath = jooqRuntime;
			jooqTask.templateDb = extension.templateDb;
		});
	}

	/** Detects the jooq version. */
	private static String detectJooqVersion() {
		URLClassLoader loader = (URLClassLoader) EmbeddedPgPlugin.class.getClassLoader();
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
