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
package org.mytake.factset.gradle;


import com.diffplug.common.base.Errors;
import com.diffplug.gradle.spotless.GroovyExtension;
import com.diffplug.gradle.spotless.SpotlessExtension;
import com.diffplug.gradle.spotless.SpotlessPlugin;
import com.diffplug.spotless.LineEnding;
import com.diffplug.spotless.changelog.gradle.ChangelogExtension;
import com.diffplug.spotless.changelog.gradle.ChangelogPlugin;
import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.plugins.BasePlugin;
import org.gradle.api.tasks.TaskProvider;
import org.mytake.factset.gradle.MtdoFactset.GrindTask;

public class FactsetPlugin implements Plugin<Project> {
	@Override
	public void apply(Project project) {
		project.getPlugins().apply(BasePlugin.class);

		// setup the templating
		TemplatePlugin.forFactset().createTasks(project);

		// setup the changelog
		project.getPlugins().apply(ChangelogPlugin.class);
		ChangelogExtension changelog = project.getExtensions().getByType(ChangelogExtension.class);
		changelog.branch("staging");
		changelog.changelogFile(project.file("README.md"));
		changelog.ifFoundBumpAdded(NEW_EVENT);
		changelog.ifFoundBumpBreaking(RETRACTION, INCLUSION_CRITERIA_CHANGE);

		// setup the text formatting
		project.getPlugins().apply(SpotlessPlugin.class);
		SpotlessExtension spotlessExt = project.getExtensions().getByType(SpotlessExtension.class);
		spotlessExt.setLineEndings(LineEnding.UNIX);
		spotlessExt.format(MtdoFactset.SAID, saidFmt -> {
			saidFmt.target(GrindLogic.INGREDIENTS + "/**/*.said");
			SpotlessTranscriptPunctuation.saidAndVtt(saidFmt);
			SpotlessTranscriptPunctuation.saidOnly(saidFmt);
		});
		spotlessExt.format(MtdoFactset.VTT, vttFmt -> {
			vttFmt.target(GrindLogic.INGREDIENTS + "/**/*.vtt");
			SpotlessTranscriptPunctuation.saidAndVtt(vttFmt);
		});
		spotlessExt.format("groovyGradle", GroovyExtension.class, ext -> {
			ext.target("build.gradle");
			ext.toggleOffOn();
			ext.greclipse();
		});

		// setup the factset
		MtdoFactset factset = project.getExtensions().create("mtdoFactset", MtdoFactset.class, project);

		TaskProvider<?> grind = project.getTasks().register("grind", GrindTask.class, grindTask -> {
			grindTask.setGroup("Build");
			grindTask.setDescription("Grinds the ingredients folder into the sausage folder.");
			grindTask.dependsOn("spotlessApply");
			grindTask.setup = factset;
			grindTask.buildDotGradle = project.file("build.gradle");
			grindTask.ingredients = project.fileTree(GrindLogic.INGREDIENTS, config -> {
				// metadata for all
				config.include("**/*.json");
				// video
				config.include("**/*.said");
				config.include("**/*.vtt");
				config.include("*.ini");
				// document
				config.include("**/*.md");
			});
			grindTask.sausageDir = project.file("sausage");
		});
		project.getTasks().getByName(BasePlugin.ASSEMBLE_TASK_NAME).dependsOn(grind);
		// setup the gui task
		Errors.rethrow().run(() -> GuiTask.setup(project, factset));
	}

	static final String NEW_EVENT = "*New event*";
	static final String RETRACTION = "**Retraction**";
	static final String INCLUSION_CRITERIA_CHANGE = "**Inclusion criteria change**";
}
