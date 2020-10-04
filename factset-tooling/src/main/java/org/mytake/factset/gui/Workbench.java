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


import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Throwing;
import com.diffplug.common.rx.Rx;
import com.diffplug.common.rx.RxBox;
import com.diffplug.common.rx.RxGetter;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.MouseClick;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtExec;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.os.OS;
import io.reactivex.Observable;
import io.reactivex.subjects.PublishSubject;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;
import java.util.function.Predicate;
import org.eclipse.jface.resource.ImageDescriptor;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.CTabFolder;
import org.eclipse.swt.custom.CTabFolder2Adapter;
import org.eclipse.swt.custom.CTabFolderEvent;
import org.eclipse.swt.custom.CTabItem;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.ToolBar;
import org.eclipse.swt.widgets.ToolItem;
import org.mytake.factset.Loc;
import org.mytake.factset.LocatedException;
import org.mytake.factset.video.Ingredients;

public class Workbench {
	private final Path rootFolder;
	private final FileTreeCtl rootFiles, ingredientFiles;
	private final CTabFolder tabFolder;
	private final Map<PaneInput, Pane> pathToTab = new HashMap<>();
	private final ToolBar toolbar;
	private final Console console;

	private final ExecutorService executor = Executors.newSingleThreadExecutor();

	public Workbench(Composite parent, Path folder) {
		this.rootFolder = folder;
		Display display = parent.getDisplay();
		display.setErrorHandler(this::logError);
		display.setRuntimeExceptionHandler(this::logError);

		Layouts.setFill(parent);
		SashForm form = new SashForm(parent, SWT.HORIZONTAL);
		form.addListener(SWT.Dispose, e -> executor.shutdown());

		Composite fileTreeCmp = new Composite(form, SWT.NONE);
		{
			Layouts.setGrid(fileTreeCmp).margin(0).spacing(OS.getNative().winMacLinux(4, 3, 3));
			Labels.createBold(fileTreeCmp, "Factset");
			rootFiles = new FileTreeCtl(fileTreeCmp, folder, path -> {
				if (Files.isDirectory(path)) {
					return false;
				}
				String name = path.getFileName().toString();
				if (name.equals("settings.gradle") || name.equals("gradle.properties")
						|| name.startsWith("gradlew")
						|| name.startsWith(".")
						|| name.startsWith("GUI_")) {
					return false;
				}
				return true;
			});
			Layouts.setGridData(rootFiles).grabHorizontal().heightHint(rootFiles.suggestedHeight());

			Layouts.newGridRow(fileTreeCmp, row -> {
				Layouts.setGrid(row).numColumns(2).spacing(0).margin(0);
				Layouts.setGridData(Labels.createBold(row, "Ingredients")).grabHorizontal().verticalAlignment(SWT.BOTTOM);
				ToolBar toolbar = new ToolBar(row, SWT.FLAT);
				ToolItem grind = new ToolItem(toolbar, SWT.PUSH);
				grind.setText("Grind all");
				grind.addListener(SWT.Selection, e -> {
					// do grind
				});
			});
			ingredientFiles = new FileTreeCtl(fileTreeCmp, folder.resolve("ingredients"));
			Layouts.setGridData(ingredientFiles).grabAll();
		}

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
		tabFolder.addListener(MouseClick.RIGHT_CLICK_EVENT, e -> {
			if (MouseClick.RIGHT.test(e)) {
				CTabItem item = tabFolder.getItem(new Point(e.x, e.y));
				if (item != null) {
					ContextMenu menu = new ContextMenu();
					Function<Predicate<CTabItem>, Runnable> closeIf = predicate -> () -> {
						Arrays.stream(tabFolder.getItems()).filter(predicate).forEach(CTabItem::dispose);
					};
					// spotless:off
					menu.addItem("Close",        closeIf.apply(tab -> tab == item));
					menu.addItem("Close others", closeIf.apply(tab -> tab != item));
					menu.addItem("Close all",    closeIf.apply(tab -> true));
					// spotless:on
					menu.openAt(e);
				}
			}
		});

		tabFolder.addListener(SWT.Selection, e -> {
			CTabItem item = tabFolder.getSelection();
			if (item != null) {
				((Pane) item.getData()).takeoverToolbar();
			}
		});
		form.setWeights(new int[]{1, 3});

		Composite consoleCmp = new Composite(folderSash, SWT.NONE);
		{
			Layouts.setGrid(consoleCmp).margin(0).spacing(0);

			toolbar = new ToolBar(consoleCmp, SWT.NONE);
			ToolItem toolbarItem = new ToolItem(toolbar, SWT.PUSH);
			toolbarItem.setText("(Actions will go here)");
			toolbarItem.setEnabled(false);

			Layouts.setGridData(toolbar).grabHorizontal();

			console = Console.nonWrapping(consoleCmp);
			Layouts.setGridData(console).grabAll();
			console.wipeAndCreateNewStream().println("Console (events will be printed here)");
		}
		folderSash.setWeights(new int[]{3, 1});

		// open files on double-click
		Rx.subscribe(Observable.merge(ingredientFiles.doubleClick(), rootFiles.doubleClick()), paths -> {
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
				pane.triggerSave();
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

	public Pane openFile(Path path) {
		return open(PaneInput.path(path));
	}

	public Pane open(PaneInput input) {
		Pane pane = pathToTab.get(input);
		if (pane == null) {
			pane = new Pane(input);
		} else {
			pane.takeoverToolbar();
		}
		tabFolder.setSelection(pane.tab);
		return pane;
	}

	static class Btn {
		String name;
		Throwing.Consumer<StringPrinter> log;
	}

	public class Pane {
		final PaneInput input;
		final CTabItem tab;
		final RxBox<Boolean> isDirty = RxBox.of(false);
		final PublishSubject<StringPrinter> save = PublishSubject.create();
		final PublishSubject<Loc> highlight = PublishSubject.create();
		final SwtExec.Guarded exec;
		final List<Btn> buttons = new ArrayList<>();

		Throwing.Consumer<StringPrinter> hackPathCleanup;

		private Pane(PaneInput input) {
			this.input = input;
			tab = new CTabItem(tabFolder, SWT.CLOSE);
			tab.setData(this);
			tab.setText(input.tabTxt());

			pathToTab.put(input, this);
			tab.addListener(SWT.Dispose, e -> {
				pathToTab.remove(input);
			});

			exec = SwtExec.immediate().guardOn(tab);
			exec.subscribe(isDirty, dirty -> {
				tab.setText(input.tabTxt() + (dirty ? "*" : ""));
			});

			addButton("Clean and Save (" + Accelerators.uiStringFor(Accelerators.SAVE) + ")", printer -> {
				save.onNext(printer);
				isDirty.set(false);
			});

			try {
				ControlWrapper control = input.createPane(tabFolder, this);
				tab.setControl(control.getRootControl());
				takeoverToolbar();
			} catch (Exception e) {
				try (PrintWriter writer = console.wipeAndCreateNewStream().toPrintWriter()) {
					e.printStackTrace(writer);
				}
				tab.dispose();
			}
		}

		public void triggerSave() {
			Btn saveBtn = buttons.get(0);
			Preconditions.checkArgument(saveBtn.name.contains("Save"));
			runBtn(saveBtn);
		}

		private void takeoverToolbar() {
			for (ToolItem item : toolbar.getItems()) {
				item.dispose();
			}
			for (Btn btn : buttons) {
				ToolItem item = new ToolItem(toolbar, SWT.PUSH);
				item.setText(btn.name);
				item.addListener(SWT.Selection, event -> runBtn(btn));
			}
		}

		private void runBtn(Btn btn) {
			StringPrinter printer = console.wipeAndCreateNewStream();
			try {
				printer.println(btn.name + " " + input.tabTxt());
				btn.log.accept(printer);
			} catch (Throwable e) {
				handleException(e, printer);
			}
		}

		public PaneInput input() {
			return input;
		}

		public Workbench workbench() {
			return Workbench.this;
		}

		public void addButton(String name, Throwing.Consumer<StringPrinter> log) {
			Btn btn = new Btn();
			btn.name = name;
			btn.log = log;
			buttons.add(btn);
		}

		public void runButton(String name) {
			Btn btn = buttons.stream()
					.filter(b -> b.name.equals(name))
					.findAny().get();
			runBtn(btn);
		}

		public Observable<Loc> highlight() {
			return highlight;
		}

		public void makeDirty() {
			isDirty.set(true);
		}

		public RxGetter<Boolean> isDirty() {
			return isDirty.readOnly();
		}

		public void logOpDontBlock(Throwing.Consumer<StringPrinter> op) {
			StringPrinter printer = console.wipeAndCreateNewStream();
			executor.submit(() -> {
				try {
					op.accept(printer);
				} catch (Throwable e) {
					handleException(e, printer);
				}
			});
		}

		void handleException(Throwable e, StringPrinter log) {
			if (e instanceof LocatedException) {
				// makes sure that highlight always triggers on the UI thread
				LocatedException located = (LocatedException) e;
				if (located.file == null || PaneInput.path(located.file).equals(input)) {
					exec.execute(() -> highlight.onNext(located.loc));
				} else {
					Pane pane = openFile(located.file);
					SwtExec.async().execute(() -> {
						// let the file open, then highlight it there
						pane.highlight.onNext(located.loc);
					});
				}
			}
			log.println(e.getMessage());
			// print the stacktrace to the IDE console, for easier debugging
			// it doesn't do much good to the end user, so don't need it in their console
			e.printStackTrace();

			if (tabFolder.getShell() == SwtMisc.assertUI().getActiveShell()) {
				// there isn't an error dialog, so we need to open one
				SwtMisc.blockForError(e.getMessage(), e.getMessage());
			}
		}

		public Ingredients ingredients() throws IOException {
			return new Ingredients(rootFolder.resolve("ingredients").toFile());
		}
	}

	public static void main(String[] args) throws IOException {
		String title;
		Path path;
		if (args.length == 0) {
			title = "U.S. Presidential Debates";
			path = Paths.get("../../mtdo-us-presidential-debates");
		} else {
			title = args[0];
			path = new File("").getCanonicalFile().toPath();
		}
		Display.setAppName(title);
		Image image = ImageDescriptor.createFromFile(Workbench.class, "/icon/logo_leaves_256.png").createImage();
		Shells.builder(SWT.SHELL_TRIM, cmp -> {
			new Workbench(cmp, path);
		}).setTitle(title)
				.setImage(image)
				.setSize(SwtMisc.scaleByFontHeight(80, 60))
				.openOnDisplayBlocking();
	}
}
