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
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.collect.Sets;
import com.diffplug.common.swt.os.OS;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.gradle.api.GradleException;
import org.gradle.api.Project;
import org.gradle.api.plugins.JavaBasePlugin;
import org.gradle.api.tasks.TaskProvider;

class TemplatePlugin {
	static TemplatePlugin forFactset() {
		TemplatePlugin template = new TemplatePlugin();
		template.mustContain(".gitignore",
				".gradle/",
				".DS_Store");
		template.mustContain(".gitattributes",
				"* text eol=lf",
				"*.jar binary");
		template.mustContain(".editorconfig",
				"root = true",
				"end_of_line = lf",
				"insert_final_newline = true",
				"trim_trailing_whitespace = true",
				"charset = utf-8",
				"indent_style = space",
				"indent_size = 2");
		template.mustContain("gradle.properties",
				"org.gradle.caching=true",
				"buildDir=.gradle/build");
		template.mustContain("README.md",
				INCLUSION_CRITERIA,
				NOTES,
				CHANGELOG_HEADER,
				ACKNOWLEDGEMENTS);
		template.mustBeExecutable("GUI_mac_osx.command");
		template.mustBeExactly("GUI_mac_osx.command",
				"#!/bin/bash",
				"cd `dirname $0`",
				"./gradlew gui");
		template.mustBeExactly("GUI_windows.bat",
				"gradlew gui");
		return template;
	}

	static final String TASK_APPLY = "templateApply";
	static final String TASK_CHECK = "templateCheck";

	Map<String, List<String>> mustContain = new HashMap<>();
	Map<String, String> mustBeExactly = new HashMap<>();
	Set<String> mustBeExecutable = new HashSet<>();

	TemplatePlugin() {}

	public void mustContain(String path, String... toContain) {
		mustContain.put(path, Arrays.asList(toContain));
	}

	public void mustBeExactly(String path, String... toContain) {
		mustBeExactly.put(path, StringPrinter.buildStringFromLines(toContain));
	}

	public void mustBeExecutable(String path) {
		mustBeExecutable.add(path);
	}

	public void createTasks(Project project) {
		TaskProvider<?> templateCheck = project.getTasks().register(TASK_CHECK);
		templateCheck.configure(task -> {
			task.setGroup("Verification");
			task.setDescription("Ensures that the MyTake.org factset template is properly configured");
			Path rootDir = project.getProjectDir().toPath();
			task.doLast(unused -> check(rootDir));
		});
		project.getTasks().named(JavaBasePlugin.CHECK_TASK_NAME).configure(check -> {
			check.dependsOn(templateCheck);
		});

		project.getTasks().register(TASK_APPLY).configure(task -> {
			task.setGroup("Build Setup");
			task.setDescription("Initializes the MyTake.org factset template");
			Path rootDir = project.getProjectDir().toPath();
			task.doLast(unused -> Errors.rethrow().run(() -> apply(rootDir)));
		});
	}

	private static final String bar = "+------------------------------\n";

	private void check(Path rootDir) {
		for (String p : Sets.union(mustContain.keySet(), mustBeExactly.keySet())) {
			Path path = rootDir.resolve(p);
			if (!Files.exists(path)) {
				throw new GradleException("'" + p + "' does not exist, run " + gradlew(TASK_APPLY) + " to create it.");
			}
			String content = Errors.rethrow().get(() -> new String(Files.readAllBytes(path), StandardCharsets.UTF_8));
			String mustBe = mustBeExactly.get(p);
			if (mustBe != null) {
				if (!content.equals(mustBe)) {
					throw new GradleException("'" + p + "' has the wrong content, run " + gradlew(TASK_APPLY) + " to fix it.");
				}
			} else {
				for (String value : mustContain.get(p)) {
					if (!content.contains(value)) {
						throw new GradleException("You must add the following to " + p + "\n\n"
								+ bar
								+ Arrays.stream(value.split("\n")).map(str -> "|" + str + "\n").collect(Collectors.joining())
								+ bar);
					}
				}
			}
		}
		if (OS.getNative().isMacOrLinux()) {
			for (String p : mustBeExecutable) {
				Path path = rootDir.resolve(p);
				if (!Files.isExecutable(path)) {
					throw new GradleException("'" + p + "' must be executable, run " + gradlew(TASK_APPLY) + " to fix it.");
				}
			}
		}
	}

	private static String gradlew(String cmd) {
		if (OS.getNative().isWindows()) {
			return "`gradlew " + TASK_APPLY + "`";
		} else {
			return "`./gradlew " + TASK_APPLY + "`";
		}
	}

	private void apply(Path rootDir) throws IOException {
		for (String p : Sets.union(mustContain.keySet(), mustBeExactly.keySet())) {
			Path path = rootDir.resolve(p);
			if (!Files.exists(path)) {
				String content = mustBeExactly.get(p);
				if (content == null) {
					content = mustContain.get(p).stream().collect(Collectors.joining("\n")) + "\n";
				}
				Files.write(path, content.getBytes(StandardCharsets.UTF_8));
			} else {
				String mustBe = mustBeExactly.get(p);
				if (mustBe != null) {
					Files.write(path, mustBe.getBytes(StandardCharsets.UTF_8));
				}
			}
		}
		if (OS.getNative().isMacOrLinux()) {
			for (String p : mustBeExecutable) {
				rootDir.resolve(p).toFile().setExecutable(true);
			}
		}
	}

	private static final String INCLUSION_CRITERIA = "## Inclusion criteria";
	private static final String NOTES = "## Notes";
	private static final String ACKNOWLEDGEMENTS = "<!-- END CHANGELOG -->\n\n# Acknowledgements";
	private static final String CHANGELOG_HEADER = StringPrinter.buildStringFromLines(
			"# Changelog",
			"All changes to this factset are categorized as either:",
			"",
			"- Minor correction: corrected typo in blah",
			"- " + FactsetPlugin.NEW_EVENT + ": a new event took place on date blah",
			"- " + FactsetPlugin.RETRACTION + ": we have removed blah, we made a mistake about blah",
			"- " + FactsetPlugin.INCLUSION_CRITERIA_CHANGE + ": we made the following change to the inclusion criteria",
			"  - ~~removed this~~ this part is the same **this part was added**",
			"  - here is why we made this change",
			"Version number is \"**retractions + inclusion criteria changes**.*new events*.minor corrections\"",
			"",
			"## [Unreleased]");
}
