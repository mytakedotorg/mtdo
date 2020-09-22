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


import com.diffplug.common.base.Throwing;
import com.diffplug.common.base.Unhandled;
import com.diffplug.spotless.Formatter;
import com.diffplug.spotless.FormatterStep;
import com.diffplug.spotless.LineEnding;
import com.diffplug.spotless.PaddedCell;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.TypeLiteral;
import compat.java2ts.VideoFactContentJava;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java2ts.FT;
import org.gradle.api.Action;
import org.gradle.api.DefaultTask;
import org.gradle.api.GradleException;
import org.gradle.api.Project;
import org.gradle.api.file.FileCollection;
import org.gradle.api.file.FileTree;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;
import org.gradle.internal.impldep.com.google.common.collect.Iterables;
import org.gradle.work.FileChange;
import org.gradle.work.Incremental;
import org.gradle.work.InputChanges;
import org.mytake.factset.Hashed;
import org.mytake.factset.JsonMisc;
import org.mytake.factset.VideoJsonFormat;
import org.mytake.factset.legacy.FactWriter;
import org.mytake.factset.video.SaidTranscript;
import org.mytake.factset.video.TranscriptMatch;
import org.mytake.factset.video.VttTranscript;

public class MtdoFactset {
	private static final String INGREDIENTS = "ingredients";

	public MtdoFactset(Project project) {
		project.getTasks().register("grind", GrindTask.class, grindTask -> {
			grindTask.setup = this;
			grindTask.buildDotGradle = project.file("build.gradle");
			grindTask.ingredients = project.fileTree(INGREDIENTS, config -> {
				// metadata for all
				config.include("**/*.json");
				// video
				config.include("**/*.said");
				config.include("**/*.vtt");
				// document
				config.include("**/*.md");
			});
			grindTask.sausageDir = project.file("sausage");
		});
	}

	public String title;
	public Action<VideoCfg> videoCfg;
	public Action<DocumentCfg> documentCfg;

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
		Action<VideoJsonFormat> perVideo = video -> {};
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
		public File buildDotGradle() {
			return buildDotGradle;
		}

		@PathSensitive(PathSensitivity.NAME_ONLY)
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
			if (!inputs.isIncremental()) {
				getLogger().info("Not incremental: removing prior outputs");
				Files.walk(sausageDir.toPath())
						.sorted(Comparator.reverseOrder())
						.map(Path::toFile)
						.forEach(File::delete);
				Files.createDirectories(sausageDir.toPath());
			}

			Map<String, String> buildJson = readBuildDotJson();

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

			for (String path : Iterables.concat(removed, changed)) {
				String dest = buildJson.remove(path);
				if (dest != null) {
					getLogger().info("cleaning: " + path + " -> " + dest);
					Files.deleteIfExists(sausageDir.toPath().resolve(dest));
				} else {
					getLogger().info("cleaning: " + path + " (already clean)");
				}
			}

			List<Hashed> hashedLinks = new ArrayList<>();

			VideoCfg video = new VideoCfg();
			setup.videoCfg.execute(video);
			try (Formatter formatter = formatterVideoJson(video)) {
				for (String path : changed) {
					getLogger().info("grinding: " + path + ".json");
					// format according to the build.gradle
					File jsonFile = ingredient(path, ".json");
					PaddedCell.DirtyState cell = PaddedCell.calculateDirtyState(formatter, jsonFile);
					if (cell.didNotConverge()) {
						throw new GradleException("perVideo does not converge for " + path);
					}
					cell.writeCanonicalTo(jsonFile);
					// determine output file
					VideoJsonFormat json = JsonMisc.fromJson(jsonFile, VideoJsonFormat.class);
					String titleSlug = FactWriter.slugify(json.fact.title);
					buildJson.put(path, titleSlug + ".json");
					getLogger().info("  into " + titleSlug + ".json");

					FT.VideoFactMeta meta = JsonMisc.fromJson(ingredient(path, ".json"), FT.VideoFactMeta.class);
					SaidTranscript said = SaidTranscript.parse(meta, ingredient(path, ".said"));
					VttTranscript vtt = VttTranscript.parse(ingredient(path, ".vtt"), VttTranscript.Mode.STRICT);
					TranscriptMatch match = new TranscriptMatch(meta, said, vtt);
					VideoFactContentJava content = match.toVideoFact();
					getLogger().info("  success");

					Hashed hashed = Hashed.asJson(content);
					Files.write(sausageDir.toPath().resolve(titleSlug + ".json"), hashed.content);
					hashedLinks.add(hashed);
				}
			}

			JsonMisc.toJson(hashedLinks, new File(sausageDir, "index.json"));
			writeBuildDotJson(buildJson);
		}

		private Formatter formatterVideoJson(VideoCfg video) {
			return formatter(str -> {
				// parse and sort speakers by name
				VideoJsonFormat json = JsonMisc.fromJson(str, VideoJsonFormat.class);
				json.speakers.sort(Comparator.comparing(speaker -> speaker.fullName));
				// format in-place (fine to reorder speakers if they want)
				video.perVideo.execute(json);
				// pretty-print
				return json.prettyPrint();
			});
		}

		private Formatter formatter(Throwing.Specific.Function<String, String, IOException> func) {
			FormatterStep step = FormatterStep.createNeverUpToDate("json format", func::apply);
			return Formatter.builder()
					.encoding(StandardCharsets.UTF_8)
					.lineEndingsPolicy(LineEnding.UNIX.createPolicy())
					.steps(Collections.singletonList(step))
					.rootDir(sausageDir.getParentFile().toPath())
					.build();
		}

		private Map<String, String> readBuildDotJson() throws IOException {
			File buildJson = new File(sausageDir, "build.json");
			if (!buildJson.exists()) {
				Files.createDirectory(sausageDir.toPath());
				return new TreeMap<>();
			}
			return JsonMisc.fromJson(buildJson, MAP_STRING);
		}

		private static TypeLiteral<Map<String, String>> MAP_STRING = new TypeLiteral<Map<String, String>>() {};

		private void writeBuildDotJson(Map<String, String> map) throws IOException {
			File buildJson = new File(sausageDir, "build.json");
			String toWrite = JsonStream.serialize(new TreeMap<>(map));
			Files.write(buildJson.toPath(), toWrite.getBytes(StandardCharsets.UTF_8));
		}

		private File ingredient(String path, String ext) {
			return new File(sausageDir.getParentFile(), INGREDIENTS + "/" + path + ext);
		}
	}

	private static String withoutExtension(String path) {
		int idx = path.lastIndexOf('.');
		return path.substring(0, idx);
	}
}
