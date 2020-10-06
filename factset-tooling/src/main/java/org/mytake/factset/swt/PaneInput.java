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
package org.mytake.factset.swt;


import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Throwing;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.spotless.ThrowingEx;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.eclipse.swt.widgets.Composite;
import org.gradle.internal.impldep.com.google.common.collect.ImmutableSet;
import org.mytake.factset.swt.video.TranscriptCtl;
import org.mytake.factset.video.Ingredients;
import org.mytake.factset.video.TranscriptMatch;

/** The universe of allowed workbench parts. */
@SuppressWarnings("serial")
public abstract class PaneInput implements Serializable {
	private final transient String tabTxt;
	private transient byte[] content;

	private byte[] content() {
		if (content == null) {
			ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
			try (ObjectOutputStream objectOutput = new ObjectOutputStream(byteStream)) {
				objectOutput.writeObject(this);
			} catch (IOException e) {
				throw ThrowingEx.asRuntime(e);
			}
			content = byteStream.toByteArray();
		}
		return content;
	}

	protected abstract Set<File> files();

	public Map<File, Long> lastModified() {
		Map<File, Long> map = new HashMap<>();
		for (File file : files()) {
			map.put(file, file.lastModified());
		}
		return map;
	}

	@Override
	public int hashCode() {
		return Arrays.hashCode(content());
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		} else if (obj instanceof PaneInput) {
			PaneInput o = (PaneInput) obj;
			return Arrays.equals(content(), o.content());
		} else {
			return false;
		}
	}

	PaneInput(String tabTxt) {
		this.tabTxt = Objects.requireNonNull(tabTxt);
	}

	/** The name of the tab. */
	public final String tabTxt() {
		return tabTxt;
	}

	/** Creates the control on the save. */
	public abstract ControlWrapper createPane(Composite parent, Workbench.Pane pane) throws IOException;

	transient protected Throwing.Consumer<StringPrinter> onSave = printer -> {};

	public void save(StringPrinter log) throws Throwable {
		log.println("Saving " + tabTxt());
		onSave.accept(log);
		log.println("Saved " + tabTxt());
	}

	public static PaneInput path(Path path) {
		return new ForPath(path);
	}

	public Path assertPath() {
		return ((ForPath) this).file.toPath();
	}

	private static class ForPath extends PaneInput {
		private final File file;

		@Override
		protected Set<File> files() {
			return ImmutableSet.of(file);
		}

		ForPath(Path path) {
			super(path.toFile().getName());
			this.file = path.toFile();
		}

		@Override
		public ControlWrapper createPane(Composite parent, Workbench.Pane pane) throws IOException {
			TextViewCtl ctl = TextEditor.createPane(parent, file.toPath(), pane);
			onSave = log -> {
				try {
					pane.hackPathCleanup.accept(log);
				} finally {
					Files.write(file.toPath(), ctl.getSourceViewer().getDocument().get().getBytes(StandardCharsets.UTF_8));
				}
			};
			pane.exec.subscribe(pane.reload, unused -> {
				pane.logOpDontBlock("Reload", printer -> {
					String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
					pane.exec.execute(() -> {
						ctl.setTxt(content.replace("\r", ""));
						pane.isDirty.set(false);
					});
				});
			});
			return ctl;
		}

		@Override
		public String toString() {
			return file.getAbsolutePath();
		}
	}

	public static PaneInput videoMatch(Ingredients ingredients, String name) {
		return new ForVideoMatch(ingredients, name);
	}

	private static class ForVideoMatch extends PaneInput {
		private final Ingredients ingredients;
		private final String name;

		@Override
		protected Set<File> files() {
			return ImmutableSet.of(
					ingredients.fileMeta(name),
					ingredients.fileVtt(name),
					ingredients.fileSaid(name));
		}

		ForVideoMatch(Ingredients ingredients, String name) {
			super(name);
			this.ingredients = ingredients;
			this.name = name;
		}

		@Override
		public ControlWrapper createPane(Composite parent, Workbench.Pane pane) throws IOException {
			TranscriptCtl ctl = TranscriptCtl.createPane(parent, pane);
			Throwing.Consumer<StringPrinter> load = printer -> {
				// do spotlessApply
				ShellExec.gradlew(printer, ingredients, "spotlessApply");
				pane.lastModified = lastModified();
				// then do the match
				TranscriptMatch match = ingredients.loadTranscript(name, printer);
				pane.exec.execute(() -> {
					ctl.setTo(match);
					pane.isDirty.set(false);
				});
			};
			pane.logOpDontBlock(toString(), load);
			onSave = printer -> ctl.save(ingredients, name);
			pane.exec.subscribe(pane.reload, unused -> {
				pane.logOpDontBlock("Reload", load);
			});
			return ctl;
		}

		@Override
		public String toString() {
			return "Match " + name;
		}
	}
}
