/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
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
