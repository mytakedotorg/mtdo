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


import com.diffplug.common.base.Errors;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.rx.Rx;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.eclipse.jface.text.Document;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.CTabFolder;
import org.eclipse.swt.custom.CTabItem;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;

public class Workbench {
	private final FileTreeCtl fileTree;
	private final CTabFolder tabFolder;
	private final Map<Path, Pane> pathToTab = new HashMap<>();
	private final Console console;

	public Workbench(Composite parent, Path folder) {
		Display display = parent.getDisplay();
		display.setErrorHandler(this::logError);
		display.setRuntimeExceptionHandler(this::logError);

		Layouts.setFill(parent);
		SashForm form = new SashForm(parent, SWT.HORIZONTAL);

		Composite fileTreeCmp = new Composite(form, SWT.NONE);
		Layouts.setGrid(fileTreeCmp).margin(0).spacing(3);
		Labels.createBold(fileTreeCmp, "Ingredients");
		fileTree = new FileTreeCtl(fileTreeCmp, folder.resolve("ingredients"));
		Layouts.setGridData(fileTree).grabAll();

		SashForm folderSash = new SashForm(form, SWT.VERTICAL);

		tabFolder = new CTabFolder(folderSash, SWT.BORDER | SWT.FLAT);
		tabFolder.setSelectionBackground(SwtMisc.getSystemColor(SWT.COLOR_LIST_SELECTION));
		tabFolder.setSimple(true);
		form.setWeights(new int[]{1, 3});

		console = Console.nonWrapping(folderSash);
		console.wipeAndCreateNewStream().println("Console (events will be printed here)");
		folderSash.setWeights(new int[]{3, 1});

		Rx.subscribe(fileTree.doubleClick(), paths -> {
			for (Path path : paths) {
				if (Files.isRegularFile(path)) {
					openFile(path);
				}
			}
		});
	}

	private void logError(Throwable e) {
		if (console == null) {
			e.printStackTrace();
		}
		StringPrinter printer = console.wipeAndCreateNewStream();
		e.printStackTrace(printer.toPrintWriter());
		printer.println("");
	}

	private void openFile(Path path) {
		Pane pane = pathToTab.get(path);
		if (pane == null) {
			pane = new Pane(path);
			pathToTab.put(path, pane);
			pane.tab.addListener(SWT.Dispose, e -> {
				pathToTab.remove(path);
			});
		}
		tabFolder.setSelection(pane.tab);
	}

	public class Pane {
		CTabItem tab;
		ControlWrapper control;

		private Pane(Path path) {
			tab = new CTabItem(tabFolder, SWT.CLOSE);
			tab.setText(path.getFileName().toString());
			control = createTab(tabFolder, path);
			tab.setControl(control.getRootControl());
		}
	}

	private ControlWrapper createTab(Composite cmp, Path path) {
		String content = Errors.rethrow().get(() -> new String(Files.readAllBytes(path), StandardCharsets.UTF_8));

		TextViewCtl ctl = new TextViewCtl(cmp);
		ctl.setup(new Document(content));

		String filename = path.getFileName().toString();
		if (filename.endsWith(".json")) {

		} else if (filename.endsWith(".said")) {

		} else if (filename.endsWith(".vtt")) {

		} else if (filename.endsWith(".ini")) {

		} else {

		}
		return ctl;
	}
}
