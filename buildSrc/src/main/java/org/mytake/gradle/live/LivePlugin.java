package org.mytake.gradle.live;

import java.io.File;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.artifacts.Dependency;
import org.gradle.api.file.FileCollection;
import org.gradle.api.plugins.JavaPlugin;
import org.gradle.api.plugins.JavaPluginConvention;
import org.gradle.api.tasks.JavaExec;
import org.gradle.api.tasks.SourceSet;

import com.google.common.collect.Iterables;

public class LivePlugin implements Plugin<Project> {
	@Override
	public void apply(Project proj) {
		// find the springloaded jar
		// https://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22org.springframework%22%20AND%20a%3A%22springloaded%22
		Dependency springLoadedDep = proj
				.getBuildscript()
				.getDependencies()
				.create("org.springframework:springloaded:1.2.8.RELEASE");
		File springLoadedJar = Iterables.getOnlyElement(
				proj.getConfigurations()
				.detachedConfiguration(springLoadedDep)
				.resolve());
		// runLive with springloaded
		Task runLive = proj.getTasks().create("runLive", JavaExec.class, config -> {
			config.setMain("common.Dev");
			config.jvmArgs("-javaagent:" + springLoadedJar.getAbsolutePath(),
					// rocker has its own live-reload mechanism
					// https://github.com/spring-projects/spring-loaded/issues/26
					"-Dspringloaded=exclusions=views..*",
					"-noverify");
			config.setClasspath(classpathForSourceSet(proj, SourceSet.TEST_SOURCE_SET_NAME));
		});
		runLive.dependsOn(proj.getTasks().findByName(JavaPlugin.TEST_CLASSES_TASK_NAME));
		runLive.setDescription("Runs common.Dev with hotswap via springloaded");
		runLive.setGroup("LIVE");
	}

	private static FileCollection classpathForSourceSet(Project proj, String sourceSetName) {
		return proj
				.getConvention()
				.getPlugin(JavaPluginConvention.class)
				.getSourceSets()
				.getByName(sourceSetName)
				.getRuntimeClasspath();
	}
}
