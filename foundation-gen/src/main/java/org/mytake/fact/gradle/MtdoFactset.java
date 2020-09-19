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

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
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
import org.gradle.work.Incremental;
import org.gradle.work.InputChanges;

public class MtdoFactset {
	public MtdoFactset(Project project) {
		project.getTasks().register("grind", GrindTask.class, grindTask -> {
			grindTask.setup = this;
			grindTask.buildDotGradle = project.file("build.gradle");
			grindTask.ingredients = project.fileTree("ingredients", config -> {
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

	public class VideoCfg {}

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
		}
	}
}
