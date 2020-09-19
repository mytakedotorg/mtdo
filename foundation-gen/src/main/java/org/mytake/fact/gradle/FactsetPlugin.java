/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.fact.gradle;

import com.diffplug.spotless.changelog.gradle.ChangelogExtension;
import com.diffplug.spotless.changelog.gradle.ChangelogPlugin;
import org.gradle.api.Plugin;
import org.gradle.api.Project;

public class FactsetPlugin implements Plugin<Project> {
	@Override
	public void apply(Project project) {
		project.getExtensions().create("mtdoFactset", MtdoFactset.class, project);

		// setup the changelog
		project.getPlugins().apply(ChangelogPlugin.class);
		ChangelogExtension changelog = project.getExtensions().getByType(ChangelogExtension.class);
		changelog.changelogFile(project.file("README.md"));
		changelog.ifFoundBumpAdded(NEW_EVENT);
		changelog.ifFoundBumpBreaking(RETRACTION, INCLUSION_CRITERIA_CHANGE);

		// setup the templating
		TemplatePlugin.forFactset().createTasks(project);
	}

	static final String NEW_EVENT = "*New event*";
	static final String RETRACTION = "**Retraction**";
	static final String INCLUSION_CRITERIA_CHANGE = "**Inclusion criteria change**";
}
