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
import com.diffplug.common.rx.RxBox;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtExec;
import com.diffplug.common.swt.SwtMisc;
import io.reactivex.subjects.PublishSubject;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.eclipse.jface.text.Document;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.CTabFolder;
import org.eclipse.swt.custom.CTabFolder2Adapter;
import org.eclipse.swt.custom.CTabFolderEvent;
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
		tabFolder.addCTabFolder2Listener(new CTabFolder2Adapter() {
			@Override
			public void close(CTabFolderEvent event) {
				Pane pane = (Pane) event.item.getData();
				if (pane.isDirty.get()) {
					if (!SwtMisc.blockForOkCancel("Lose unsaved changes", "Do you want to lose your changes?")) {
						event.doit = false;
					}
				}
			}
		});
		form.setWeights(new int[]{1, 3});

		console = Console.nonWrapping(folderSash);
		console.wipeAndCreateNewStream().println("Console (events will be printed here)");
		folderSash.setWeights(new int[]{3, 1});

		// open files on double-click
		Rx.subscribe(fileTree.doubleClick(), paths -> {
			for (Path path : paths) {
				if (Files.isRegularFile(path)) {
					openFile(path);
				}
			}
		});
		// app-global shortcuts
		parent.getDisplay().addFilter(SWT.KeyDown, e -> {
			if (Accelerators.checkKey(e, Accelerators.SAVE)) {
				CTabItem item = tabFolder.getSelection();
				if (item == null) {
					return;
				}
				Pane pane = (Pane) item.getData();
				pane.save();
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
		}
		tabFolder.setSelection(pane.tab);
	}

	public class Pane {
		final CTabItem tab;
		final ControlWrapper control;
		final RxBox<Boolean> isDirty = RxBox.of(false);
		final PublishSubject<Pane> save = PublishSubject.create();
		final SwtExec.Guarded exec;

		private Pane(Path path) {
			tab = new CTabItem(tabFolder, SWT.CLOSE);
			tab.setData(this);
			tab.setText(path.getFileName().toString());

			pathToTab.put(path, this);
			tab.addListener(SWT.Dispose, e -> {
				pathToTab.remove(path);
			});

			control = createTab(tabFolder, path, this);
			tab.setControl(control.getRootControl());

			exec = SwtExec.immediate().guardOn(tab);
			exec.subscribe(isDirty, dirty -> {
				tab.setText(path.getFileName().toString() + (dirty ? "*" : ""));
			});
		}

		public void makeDirty() {
			isDirty.set(true);
		}

		private void save() {
			save.onNext(this);
			isDirty.set(false);
		}
	}

	private ControlWrapper createTab(Composite cmp, Path path, Pane pane) {
		String content = Errors.rethrow().get(() -> new String(Files.readAllBytes(path), StandardCharsets.UTF_8));

		SyntaxHighlighter highlighter = SyntaxHighlighter.none();
		String filename = path.getFileName().toString();
		if (filename.endsWith(".json")) {
			highlighter = SyntaxHighlighter.json();
		} else if (filename.endsWith(".ini")) {
			highlighter = SyntaxHighlighter.ini();
		}

		Document doc = new Document(content);
		TextViewCtl ctl = new TextViewCtl(cmp);
		ctl.setup(doc, highlighter);
		ctl.getSourceViewer().getTextWidget().addListener(SWT.Modify, e -> pane.makeDirty());

		pane.exec.subscribe(pane.save, s -> {
			Errors.dialog().run(() -> {
				Files.write(path, doc.get().replace("\r", "").getBytes(StandardCharsets.UTF_8));
			});
		});
		return ctl;
	}
}
