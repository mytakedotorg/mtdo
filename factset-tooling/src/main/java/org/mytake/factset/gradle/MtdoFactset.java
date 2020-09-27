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


import com.diffplug.common.base.Unhandled;
import com.diffplug.common.collect.Iterables;
import com.google.gson.reflect.TypeToken;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java2ts.FT;
import java2ts.FT.FactLink;
import org.gradle.api.Action;
import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.Project;
import org.gradle.api.file.FileCollection;
import org.gradle.api.file.FileTree;
import org.gradle.api.plugins.BasePlugin;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;
import org.gradle.api.tasks.TaskProvider;
import org.gradle.work.FileChange;
import org.gradle.work.Incremental;
import org.gradle.work.InputChanges;
import org.mytake.factset.GitJson;
import org.mytake.factset.JsonMisc;

public class MtdoFactset {

	public MtdoFactset(Project project) {
		TaskProvider<?> grind = project.getTasks().register("grind", GrindTask.class, grindTask -> {
			grindTask.setGroup("Build");
			grindTask.setDescription("Grinds the ingredients folder into the sausage folder.");
			grindTask.setup = this;
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
	}

	public String title;
	public Action<VideoCfg> videoCfg;
	public Action<DocumentCfg> documentCfg = document -> {};

	public void video(Action<VideoCfg> videoCfg) {
		if (this.videoCfg != null) {
			throw new GradleException("You can only call `video {` once.");
		}
		this.videoCfg = videoCfg;
	}

	public void document(Action<DocumentCfg> documentCfg) {
		if (this.documentCfg != null) {
			throw new GradleException("You can only call `document {` once.");
		}
		this.documentCfg = documentCfg;
	}

	public static class VideoCfg {
		Action<FT.VideoFactMeta> perVideo = video -> {};

		public void json(Action<FT.VideoFactMeta> perVideo) {
			this.perVideo = perVideo;
		}
	}

	public class DocumentCfg {}

	@CacheableTask
	public static class GrindTask extends DefaultTask {
		/** Configures the grinding (ignored for up-to-date). */
		private MtdoFactset setup;
		/** Used as an up-to-date proxy for setup. */
		private File buildDotGradle;
		private FileTree ingredients;
		private File sausageDir;

		@Internal
		public MtdoFactset getSetup() {
			return setup;
		}

		@PathSensitive(PathSensitivity.NAME_ONLY)
		@InputFile
		public File getBuildDotGradle() {
			return buildDotGradle;
		}

		@PathSensitive(PathSensitivity.RELATIVE)
		@Incremental
		@InputFiles
		public FileCollection getIngredients() {
			return ingredients;
		}

		@OutputDirectory
		public File getSausageDir() {
			return sausageDir;
		}

		@TaskAction
		public void performAction(InputChanges inputs) throws Exception {
			// configure the video settings
			VideoCfg video = new VideoCfg();
			setup.videoCfg.execute(video);

			// wipe the sausage dir on non-incremental builds
			if (!inputs.isIncremental()) {
				getLogger().info("Not incremental: removing prior outputs");
				Files.walk(sausageDir.toPath())
						.sorted(Comparator.reverseOrder())
						.map(Path::toFile)
						.forEach(File::delete);
				Files.createDirectories(sausageDir.toPath());
			}

			// find all changed and removed files
			Set<String> changed = new TreeSet<>();
			Set<String> removed = new TreeSet<>();
			Iterable<FileChange> changes = inputs.getFileChanges(ingredients);
			for (FileChange change : changes) {
				switch (change.getChangeType()) {
				case MODIFIED:
				case ADDED:
					changed.add(withoutExtension(change.getNormalizedPath()));
					break;
				case REMOVED:
					removed.add(withoutExtension(change.getNormalizedPath()));
					break;
				default:
					throw Unhandled.enumException(change.getChangeType());
				}
			}

			// for every removed/changed file, delete it from sausage
			Map<String, String> buildJson = readBuildDotJson();
			for (String path : Iterables.concat(removed, changed)) {
				String dest = buildJson.remove(path);
				if (dest != null) {
					getLogger().info("cleaning: " + path + " -> " + dest);
					Files.deleteIfExists(sausageDir.toPath().resolve(dest + ".json"));
				} else {
					getLogger().info("cleaning: " + path + " (already clean)");
				}
			}

			// configure the grinding logic
			GrindLogic grind = new GrindLogic(sausageDir.getParentFile().toPath(), video, getLogger());
			// grind each changed file
			grind.grind(changed, buildJson);
			GitJson.write(buildJson).toPretty(new File(sausageDir, "build.json"));
			// write out the index
			List<FactLink> factLinks = grind.buildIndex(sausageDir.toPath());
			GitJson.write(factLinks).toCompact(new File(sausageDir, "index.json"));
			// generate any warnings
			GrindLogic.Validator validator = grind.validator();
			for (Map.Entry<String, String> entry : buildJson.entrySet()) {
				for (String warning : validator.warningsFor(entry.getKey())) {
					getLogger().warn(GrindLogic.INGREDIENTS + "/" + entry.getKey() + ".json: " + warning);
				}
			}
			String allFound = validator.allFound();
			if (!allFound.isEmpty()) {
				getLogger().warn(allFound);
			}
		}

		private Map<String, String> readBuildDotJson() throws IOException {
			File buildJson = new File(sausageDir, "build.json");
			if (!buildJson.exists()) {
				Files.createDirectories(sausageDir.toPath());
				return new TreeMap<>();
			}
			return JsonMisc.fromJson(buildJson, MAP_STRING);
		}

		private static final TypeToken<Map<String, String>> MAP_STRING = new TypeToken<Map<String, String>>() {};
	}

	private static String withoutExtension(String path) {
		int idx = path.lastIndexOf('.');
		if (idx == -1) {
			return path;
		}
		return path.substring(0, idx);
	}
}
