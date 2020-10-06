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


import com.diffplug.common.base.Errors;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import javax.annotation.Nullable;
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
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Listener;
import org.mytake.factset.Loc;
import org.mytake.factset.video.Ingredients;

public class Workbench {
	final Path rootFolder;
	private final FileTreeCtl rootFiles, ingredientFiles;
	private final CTabFolder tabFolder;
	private final Map<PaneInput, Pane> pathToTab = new HashMap<>();
	private final Composite toolbar;
	private final ProgressCtl progress;
	private final Console console;

	private final ExecutorService executor = Executors.newSingleThreadExecutor();

	public Workbench(Composite parent, Path folder) {
		parent.getShell().addListener(SWT.Close, e -> System.exit(0));
		this.rootFolder = folder;
		Display display = parent.getDisplay();
		display.setErrorHandler(Errors.dialog()::accept);
		display.setRuntimeExceptionHandler(Errors.dialog()::accept);

		Layouts.setFill(parent);
		SashForm form = new SashForm(parent, SWT.HORIZONTAL);
		form.addListener(SWT.Dispose, e -> executor.shutdown());

		Composite fileTreeCmp = new Composite(form, SWT.NONE);
		{
			int spacing = OS.getNative().winMacLinux(4, 3, 3);

			Layouts.setGrid(fileTreeCmp).margin(0).spacing(0);
			Layouts.setGridData(Labels.createBold(fileTreeCmp, "Factset")).verticalIndent(spacing);
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

			Layouts.setGridData(Layouts.newGridRow(fileTreeCmp, row -> {
				Layouts.setGrid(row).numColumns(2).spacing(0).margin(0);
				Layouts.setGridData(Labels.createBold(row, "Ingredients")).grabHorizontal().verticalAlignment(SWT.BOTTOM);
				Labels.createBtn(row, "save all and grind " + Accelerators.uiStringFor(Accelerators.GRIND), this::saveAllAndGrind);
			})).grabHorizontal().verticalIndent(spacing);
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
			Composite toolbarCmp = new Composite(consoleCmp, SWT.NONE);
			Layouts.setGridData(toolbarCmp).grabHorizontal();
			{
				Layouts.setGrid(toolbarCmp).margin(0).numColumns(2);
				toolbar = new Composite(toolbarCmp, SWT.NONE);
				Layouts.setGridData(toolbar).grabHorizontal();
				Layouts.setRow(toolbar).margin(0);
				Labels.create(toolbar, "(Actions will go here)");

				progress = new ProgressCtl(toolbarCmp, this);
			}

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
			} else if (Accelerators.checkKey(e, Accelerators.GRIND)) {
				saveAllAndGrind();
			}
		});
		Listener checkLastModified = e -> {
			CTabItem item = tabFolder.getSelection();
			if (item != null) {
				((Pane) item.getData()).checkLastModified();
			}
		};
		parent.getDisplay().addFilter(SWT.Activate, checkLastModified);
		parent.getDisplay().addFilter(SWT.FocusIn, checkLastModified);
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

	public void logOpDontBlock(String operationTitle, Throwing.Consumer<StringPrinter> op) {
		logOpDontBlock(operationTitle, null, op);
	}

	private void logOpDontBlock(String operationTitle, @Nullable Pane pane, Throwing.Consumer<StringPrinter> op) {
		Consumer<Optional<Throwable>> consoleFinalizer = progress.begin(pane, operationTitle);
		StringPrinter log = console.wipeAndCreateNewStream();
		executor.submit(() -> {
			try {
				op.accept(log);
				consoleFinalizer.accept(Optional.empty());
			} catch (Throwable e) {
				consoleFinalizer.accept(Optional.of(e));
			}
		});
	}

	private void logOpBlocking(String operationTitle, @Nullable Pane pane, Throwing.Consumer<StringPrinter> op) {
		Consumer<Optional<Throwable>> consoleFinalizer = progress.begin(pane, operationTitle);
		StringPrinter log = console.wipeAndCreateNewStream();
		try {
			op.accept(log);
			consoleFinalizer.accept(Optional.empty());
		} catch (Throwable e) {
			consoleFinalizer.accept(Optional.of(e));
		}
	}

	static class Btn {
		String name;
		Throwing.Consumer<StringPrinter> log;
	}

	public class Pane {
		final PaneInput input;
		final CTabItem tab;
		final RxBox<Boolean> isDirty = RxBox.of(false);
		final PublishSubject<Loc> highlight = PublishSubject.create();
		final PublishSubject<Pane> reload = PublishSubject.create();
		final SwtExec.Guarded exec;
		final List<Btn> buttons = new ArrayList<>();
		Map<File, Long> lastModified;

		Throwing.Consumer<StringPrinter> hackPathCleanup = printer -> {};

		private Pane(PaneInput input) {
			this.input = input;
			tab = new CTabItem(tabFolder, SWT.CLOSE);
			tab.setData(this);
			tab.setText(input.tabTxt());

			pathToTab.put(input, this);
			tab.addListener(SWT.Dispose, e -> {
				pathToTab.remove(input);
				Arrays.stream(toolbar.getChildren()).filter(btn -> btn.getData() == this).forEach(Control::dispose);
			});

			exec = SwtExec.immediate().guardOn(tab);
			exec.subscribe(isDirty, dirty -> {
				tab.setText(input.tabTxt() + (dirty ? "*" : ""));
			});

			addButton("clean and save " + Accelerators.uiStringFor(Accelerators.SAVE), printer -> {
				input.save(printer);
				isDirty.set(false);
			});

			try {
				ControlWrapper control = input.createPane(tabFolder, this);
				tab.setControl(control.getRootControl());
				takeoverToolbar();
				lastModified = input.lastModified();
			} catch (Exception e) {
				workbench().logOpBlocking("Opening " + input.tabTxt(), this, printer -> {
					throw e;
				});
				tab.dispose();
			}
		}

		void checkLastModified() {
			if (lastModified == null) {
				return;
			}
			Map<File, Long> newLastModified = input.lastModified();
			if (!newLastModified.equals(lastModified)) {
				reload.onNext(this);
				lastModified = newLastModified;
			}
		}

		private static final String save = "save";

		public void triggerSave() {
			Btn saveBtn = buttons.get(0);
			Preconditions.checkArgument(saveBtn.name.contains(save));
			runBtn(saveBtn);
		}

		private void takeoverToolbar() {
			Arrays.stream(toolbar.getChildren()).forEach(Control::dispose);
			for (Btn btn : buttons) {
				ControlWrapper ctl = Labels.createBtn(toolbar, btn.name, () -> runBtn(btn));
				ctl.getRootControl().setData(this);
			}
			toolbar.requestLayout();
			checkLastModified();
		}

		private void runBtn(Btn btn) {
			workbench().logOpBlocking(input.tabTxt() + " " + btn.name, this, btn.log);
			if (btn.name.contains(save)) {
				lastModified = input.lastModified();
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

		public void logOpDontBlock(String operationName, Throwing.Consumer<StringPrinter> op) {
			workbench().logOpDontBlock(input.tabTxt() + " " + operationName, this, op);
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
	}

	public Ingredients ingredients() throws IOException {
		return new Ingredients(rootFolder.resolve("ingredients").toFile());
	}

	private void saveAllAndGrind() {
		logOpDontBlock("gradlew assemble", printer -> {
			// save all files
			SwtExec.blocking().execute(() -> {
				pathToTab.values().forEach(pane -> {
					if (pane.isDirty.get()) {
						Errors.rethrow().run(() -> pane.input().save(printer));
					}
				});
			});
			// do the grind
			ShellExec.gradlew(printer, ingredients(), "assemble");
		});
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
