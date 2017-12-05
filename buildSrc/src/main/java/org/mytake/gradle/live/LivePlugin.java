package org.mytake.gradle.live;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.Task;
import org.gradle.api.artifacts.Dependency;
import org.gradle.api.file.FileCollection;
import org.gradle.api.plugins.JavaPluginConvention;
import org.gradle.api.tasks.JavaExec;
import org.gradle.api.tasks.SourceSet;
import org.gradle.tooling.CancellationTokenSource;
import org.gradle.tooling.GradleConnectionException;
import org.gradle.tooling.GradleConnector;
import org.gradle.tooling.ProjectConnection;
import org.gradle.tooling.ResultHandler;

import com.diffplug.common.base.Box;
import com.diffplug.common.base.Errors;
import com.google.common.collect.Iterables;

/**
 * This creates the `live` task which does three things.  If you exit
 * by going to the `/exit` URL, then it will exit cleanly and the
 * gradle daemons will be hot for the next run.
 * 
 * - spawns `gradlew :server:testClasses -t`
 * - spawns `gulp proxyDev`
 * - spawns commonDev with
 *     + SpringLoaded for hotswap
 *     + Except the `views` package, because rocker has its own hotswap
 * 
 * Sass changes trigger instant updates, code changes require
 * a manual refresh.
 */
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
		// runs springloaded, except for the rocker files because they have their own livereload capability
		Task live = proj.getTasks().create("live", JavaExec.class, cfg -> {
			cfg.setMain("common.Dev");
			cfg.jvmArgs("-javaagent:" + springLoadedJar.getAbsolutePath(),
					// rocker has its own live-reload mechanism
					// https://github.com/spring-projects/spring-loaded/issues/26
					"-Dspringloaded=exclusions=views..*",
					"-noverify");
			cfg.setClasspath(classpathForSourceSet(proj, SourceSet.TEST_SOURCE_SET_NAME));
		});
		live.dependsOn(":server:testClasses");
		classWatcher(live);
		assetWatcher(live);
		live.setDescription("Runs common.Dev with hotswap via springloaded and browserSync on assets");
		live.setGroup("LIVE");
	}

	private static FileCollection classpathForSourceSet(Project proj, String sourceSetName) {
		return proj
				.getConvention()
				.getPlugin(JavaPluginConvention.class)
				.getSourceSets()
				.getByName(sourceSetName)
				.getRuntimeClasspath();
	}

	/** Spawns "gradlew :server:testClasses -t" and sinks to System.out/err" */
	static void classWatcher(Task task) {
		// launch a gradle continuous build on the classes
		CancellationTokenSource cancellationSource = GradleConnector.newCancellationTokenSource();
		task.doFirst("classWatcherStart", unused -> {
			ProjectConnection connection = GradleConnector.newConnector()
					.forProjectDirectory(task.getProject().getRootDir())
					.connect();
			connection.newBuild()
			.withArguments(":server:testClasses", "-t")
			.setStandardOutput(System.out)
			.setStandardError(System.err)
			.withCancellationToken(cancellationSource.token())
			.run(new ResultHandler<Void>() {
				@Override
				public void onComplete(Void success) {
					// noop
				}

				@Override
				public void onFailure(GradleConnectionException error) {
					task.getLogger().error("classWatcher", error);
				}
			});
		});
		task.doLast("classWatcherStop", unused -> {
			cancellationSource.cancel();
		});
	}

	/** Spawns "gulp proxyDev" and sinks to System.out/err" */
	static void assetWatcher(Task task) {
		Box.Nullable<Process> process = Box.Nullable.ofNull();
		task.doFirst("assetWatcherStart", unused -> {
			ProcessBuilder builder = new ProcessBuilder(getPlatformCmds("gulp proxyDev"));
			builder.directory(task.getProject().getRootProject().file("client"));
			process.set(Errors.rethrow().get(builder::start));
			sink(process.get().getInputStream(), System.out);
			sink(process.get().getErrorStream(), System.err);
		});
		task.doLast("assetWatcherStop", unused -> {
			process.get().destroy();
		});
	}

	/** Spawns a thread to sink an input stream to an outpu stream. */
	private static void sink(InputStream input, OutputStream output) {
		new Thread() {
			@Override
			public void run() {
				Errors.rethrow().run(() -> {
					byte[] buffer = new byte[1024];
					int numRead;
					while ((numRead = input.read(buffer)) != -1) {
						output.write(buffer, 0, numRead);
					}
				});
			}
		}.start();
	}

	/** Prepends any arguments necessary to run a command at the console. */
	private static List<String> getPlatformCmds(String cmd) {
		boolean isWin = System.getProperty("os.name").toLowerCase().contains("win");
		if (isWin) {
			return Arrays.asList("cmd", "/c", cmd);
		} else {
			return Arrays.asList("/bin/sh", "-c", cmd);
		}
	}
}
