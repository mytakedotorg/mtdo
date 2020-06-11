package org.mytake.gradle.jsweet;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.artifacts.dsl.RepositoryHandler;

/** Customize the jsweet transpilation process. */
public class JSweetRepoPlugin implements Plugin<Project> {
	@Override
	public void apply(Project project) {
		RepositoryHandler handler = project.getRepositories();
		handler.add(handler.mavenCentral());
		handler.add(handler.maven(jsweet -> {
			jsweet.setUrl("http://repository.jsweet.org/artifactory/libs-release-local");
			jsweet.setAllowInsecureProtocol(true);
			jsweet.content(content -> {
				content.includeGroup("org.jsweet");
				content.includeGroup("org.jsweet.ext");
			});
		}));
	}
}
