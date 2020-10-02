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
package org.mytake.factset.gui;


import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Throwing;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.spotless.ThrowingEx;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.PrintWriter;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Objects;
import org.eclipse.swt.widgets.Composite;
import org.mytake.factset.gui.video.TranscriptCtl;
import org.mytake.factset.video.Ingredients;

/** The universe of allowed workbench parts. */
@SuppressWarnings("serial")
public abstract class WorkbenchInput implements Serializable {
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

	@Override
	public int hashCode() {
		return Arrays.hashCode(content());
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		} else if (obj instanceof WorkbenchInput) {
			WorkbenchInput o = (WorkbenchInput) obj;
			return Arrays.equals(content(), o.content());
		} else {
			return false;
		}
	}

	WorkbenchInput(String tabTxt) {
		this.tabTxt = Objects.requireNonNull(tabTxt);
	}

	/** The name of the tab. */
	public final String tabTxt() {
		return tabTxt;
	}

	/** Creates the control on the save. */
	public abstract ControlWrapper createPane(Composite parent, Workbench.Pane pane) throws IOException;

	/** Helper function for saving the the content that they opened. */
	protected void hookSave(Workbench.Pane pane, Throwing.Consumer<StringPrinter> saveAction) {
		pane.exec.subscribe(pane.save, printer -> {
			try {
				printer.println("Saving " + tabTxt());
				saveAction.accept(printer);
				printer.println("\rSaved " + tabTxt());
			} catch (Throwable e) {
				try (PrintWriter writer = printer.toPrintWriter()) {
					e.printStackTrace(writer);
				}
			}
		});
	}

	public static WorkbenchInput path(Path path) {
		return new ForPath(path);
	}

	private static class ForPath extends WorkbenchInput {
		private final File file;

		ForPath(Path path) {
			super(path.toFile().getName());
			this.file = path.toFile();
		}

		@Override
		public ControlWrapper createPane(Composite parent, Workbench.Pane pane) throws IOException {
			TextViewCtl ctl = ContentTypes.createPane(parent, file.toPath(), pane);
			hookSave(pane, printer -> {
				String content = ctl.getSourceViewer().getDocument().get().replace("\r", "");
				Files.write(file.toPath(), content.getBytes(StandardCharsets.UTF_8));
			});
			return ctl;
		}
	}

	public static WorkbenchInput syncVideo(Ingredients ingredients, Path path) {
		return new ForSyncVideo(ingredients, ingredients.name(path));
	}

	private static class ForSyncVideo extends WorkbenchInput {
		private final Ingredients ingredients;
		private final String name;

		ForSyncVideo(Ingredients ingredients, String name) {
			super(name);
			this.ingredients = ingredients;
			this.name = name;
		}

		@Override
		public ControlWrapper createPane(Composite parent, Workbench.Pane pane) throws IOException {
			TranscriptCtl ctl = TranscriptCtl.createPane(parent, pane);
			ctl.setTo(ingredients.loadTranscript(name));
			hookSave(pane, printer -> {
				ctl.save(ingredients, name);
			});
			return ctl;
		}
	}
}
