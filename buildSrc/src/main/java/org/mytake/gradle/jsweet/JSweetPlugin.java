/* 
 * Copyright (C) 2015 Louis Grignon <louis.grignon@gmail.com>
 * Modified 2020 for use by MyTake.org
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.mytake.gradle.jsweet;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.logging.Logger;
import org.gradle.api.plugins.BasePlugin;
import org.gradle.api.plugins.JavaPlugin;
import org.gradle.api.plugins.JavaPluginConvention;
import org.gradle.api.tasks.Delete;
import org.gradle.api.tasks.SourceSet;
import org.gradle.api.tasks.SourceSetContainer;

/**
 * JSweet transpilation plugin for Gradle
 * 
 * @author Louis Grignon
 *
 */
public class JSweetPlugin implements Plugin<Project> {
	@Override
	public void apply(final Project project) {
		Logger logger = project.getLogger();
		logger.info("applying jsweet plugin");

		if (!project.getPlugins().hasPlugin(JavaPlugin.class)) {
			logger.error("No java or war plugin detected. Enable java or war plugin.");
			throw new IllegalStateException("No java or war plugin detected. Enable java or war plugin.");
		}

		JSweetPluginExtension extension = project.getExtensions().create("jsweet", JSweetPluginExtension.class);

		JavaPluginConvention javaPluginConvention = project.getConvention().getPlugin(JavaPluginConvention.class);
		SourceSetContainer sourceSets = javaPluginConvention.getSourceSets();
		SourceSet mainSources = sourceSets.getByName(SourceSet.MAIN_SOURCE_SET_NAME);

		project.getTasks().register("jsweet", JSweetTranspileTask.class, task -> {
			task.setGroup("generate");
			task.dependsOn(JavaPlugin.COMPILE_JAVA_TASK_NAME);
			task.configuration = extension;
			task.sources = mainSources.getAllJava();
			task.classpath = mainSources.getCompileClasspath();
		});
		project.getTasks().named(BasePlugin.CLEAN_TASK_NAME, cleanTask -> {
			((Delete) cleanTask).delete(extension.getTsOut());
		});
	}
}
