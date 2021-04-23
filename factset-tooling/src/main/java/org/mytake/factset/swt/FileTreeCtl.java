/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
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


import com.diffplug.common.base.Box;
import com.diffplug.common.base.Errors;
import com.diffplug.common.collect.ImmutableList;
import com.diffplug.common.collect.Iterables;
import com.diffplug.common.rx.RxBox;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Corner;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.MouseClick;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.SwtRx;
import com.diffplug.common.swt.jface.ColumnViewerFormat;
import com.diffplug.common.swt.jface.ViewerMisc;
import com.diffplug.common.swt.widgets.ButtonPanel;
import com.diffplug.common.tree.TreeDef;
import io.reactivex.Observable;
import io.reactivex.subjects.PublishSubject;
import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;
import org.jetbrains.annotations.Nullable;

class FileTreeCtl extends ControlWrapper.AroundControl<Composite> {
	// files at top, folders at bottom, most-recent dates first
	private static Comparator<Path> ORDER = Comparator.<Path> comparingInt(path -> Files.isDirectory(path) ? 1 : 0)
			.thenComparing(path -> path.getFileName(), Comparator.reverseOrder());

	private final Path root;
	private final TreeViewer viewer;
	private final RxBox<ImmutableList<Path>> selection;
	private final PublishSubject<ImmutableList<Path>> doubleClick = PublishSubject.create();

	public FileTreeCtl(Composite parent, Path folder) {
		this(parent, folder, path -> !path.getFileName().toString().startsWith("."));
	}

	public FileTreeCtl(Composite parent, Path folder, DirectoryStream.Filter<Path> include) {
		super(new Composite(parent, SWT.BORDER));
		this.root = folder;

		// define the format of the tree
		ColumnViewerFormat<Path> format = ColumnViewerFormat.builder();
		format.setStyle(SWT.VIRTUAL | SWT.MULTI).setHeaderVisible(false);
		format.addColumn().setText("Name").setLabelProviderText(path -> path.getFileName().toString());

		// create the tree viewer
		viewer = format.buildTree(wrapped);
		// define the structure of the tree's contents
		ViewerMisc.setLazyTreeContentProvider(viewer, new TreeDef.Parented<Path>() {
			@Override
			public List<Path> childrenOf(Path node) {
				if (!Files.isDirectory(node)) {
					return Collections.emptyList();
				}
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(node, include)) {
					return StreamSupport.stream(stream.spliterator(), false)
							.sorted(ORDER)
							.collect(Collectors.toList());
				} catch (IOException e) {
					Errors.dialog().accept(e);
					return Collections.emptyList();
				}
			}

			@Override
			public Path parentOf(Path node) {
				return node.getParent();
			}
		});
		viewer.setInput(folder);
		selection = ViewerMisc.multiSelectionList(viewer);
		viewer.getTree().addListener(SWT.DefaultSelection, e -> {
			doubleClick.onNext(selection.get());
		});
		viewer.getTree().addListener(MouseClick.RIGHT_CLICK_EVENT, e -> {
			if (MouseClick.RIGHT.test(e)) {
				rightClick(selection.get()).openAt(e);
			}
		});
	}

	public RxBox<ImmutableList<Path>> selection() {
		return selection;
	}

	public Observable<ImmutableList<Path>> doubleClick() {
		return doubleClick;
	}

	public int suggestedHeight() {
		return viewer.getTree().getItemCount() * viewer.getTree().getItemHeight();
	}

	////////////////////////////////////////
	// right-click file manipulation menu //
	////////////////////////////////////////
	private ContextMenu rightClick(ImmutableList<Path> paths) {
		ContextMenu menu = new ContextMenu();
		if (paths.isEmpty()) {
			menu.addItem("Create file", () -> Kind.FILE.createChild(this, root));
			menu.addItem("Create folder", () -> Kind.FOLDER.createChild(this, root));
		} else if (paths.size() == 1) {
			Path path = paths.get(0);
			menu.addItem("Open", () -> doubleClick.onNext(paths));
			if (Files.isDirectory(path)) {
				menu.addItem("Create child file", () -> Kind.FILE.createChild(this, path));
				menu.addItem("Create child folder", () -> Kind.FOLDER.createChild(this, path));
			}
			menu.addItem("Delete", () -> delete(Collections.singleton(path)));
			menu.addItem("Rename", () -> rename(path));
		} else {
			menu.addItem("Open all", () -> doubleClick.onNext(paths));
			menu.addItem("Delete all", () -> delete(paths));
			if (paths.stream().allMatch(Files::isRegularFile)) {
				Set<String> commonNames = paths.stream()
						.map(path -> {
							String filename = path.getFileName().toString();
							int lastDot = filename.lastIndexOf('.');
							return lastDot == -1 ? filename : filename.substring(0, lastDot);
						}).collect(Collectors.toSet());
				if (commonNames.size() == 1) {
					menu.addItem("Rename all", () -> renameAll(paths, Iterables.getOnlyElement(commonNames)));
				}
			}
		}
		return menu;
	}

	private void delete(Collection<Path> paths) {
		if (SwtMisc.blockForQuestion("Confirm delete", "Are you sure you want to delete:\n" +
				paths.stream().map(p -> root.relativize(p).toString()).collect(Collectors.joining("\n")))) {
			Errors.dialog().run(() -> {
				for (Path path : paths) {
					doDelete(path);
				}
				refresh();
			});
		}
	}

	private static void doDelete(Path path) throws IOException {
		if (Files.isDirectory(path)) {
			Files.walk(path)
					.sorted(Comparator.reverseOrder())
					.map(Path::toFile)
					.forEach(File::delete);
		} else {
			Files.delete(path);
		}
	}

	private void rename(Path path) {
		String name = nameDialog("Rename", path.getFileName().toString());
		if (name != null) {
			Errors.dialog().run(() -> {
				Path newName = path.getParent().resolve(name);
				Files.move(path, newName);
				refresh();
			});
		}
	}

	private void renameAll(Collection<Path> paths, String commonName) {
		String name = nameDialog("Rename", commonName);
		if (name == null) {
			return;
		}
		Errors.dialog().run(() -> {
			for (Path path : paths) {
				String filename = path.getFileName().toString();
				int lastDot = filename.lastIndexOf('.');
				String ext = lastDot == -1 ? "" : filename.substring(lastDot);
				Path newPath = path.getParent().resolve(name + ext);
				Files.move(path, newPath);
			}
			refresh();
		});
	}

	private static enum Kind {
		FILE, FOLDER;

		void createChild(FileTreeCtl ctl, Path parent) {
			String name = ctl.nameDialog("New " + name().toLowerCase(Locale.US), "");
			if (name == null) {
				return;
			}
			Path path = parent.resolve(name);
			Errors.dialog().run(() -> {
				if (this == FILE) {
					Files.createFile(path);
				} else {
					Files.createDirectory(path);
				}
				ctl.refresh();
			});
		}
	}

	private @Nullable String nameDialog(String operation, String start) {
		int width = viewer.getTree().getSize().x;
		int left = viewer.getTree().toDisplay(viewer.getTree().getLocation()).x;
		int centerY = SwtMisc.assertUI().getCursorLocation().y;
		int centerX = left + width / 2;
		Box.Nullable<String> result = Box.Nullable.ofNull();
		Shells.builder(SWT.APPLICATION_MODAL, cmp -> {
			Layouts.setGrid(cmp);
			Labels.create(cmp, operation + " " + start);
			Text txt = new Text(cmp, SWT.SINGLE | SWT.BORDER);
			Layouts.setGridData(txt).grabHorizontal();
			txt.setText(start);
			RxBox<String> txtStr = SwtRx.textImmediate(txt);

			Runnable ok = () -> {
				result.set(txtStr.get());
				cmp.getShell().dispose();
			};
			Runnable cancel = cmp.getShell()::dispose;
			txt.addListener(SWT.KeyDown, e -> {
				if (Accelerators.isEnter(e)) {
					ok.run();
				} else if (e.keyCode == SWT.ESC) {
					cancel.run();
				}
			});

			ButtonPanel panel = ButtonPanel.builder()
					.add(operation, ok)
					.add("Cancel", cancel)
					.build(cmp);
			Layouts.setGridData(panel).grabHorizontal();
		})
				.setSize(width, SWT.DEFAULT)
				.setLocation(Corner.CENTER, new Point(centerX, centerY))
				.openOnActiveBlocking();
		return result.get();
	}

	private void refresh() {
		Object[] expanded = viewer.getVisibleExpandedElements();
		viewer.refresh();
		viewer.setExpandedElements(expanded);
	}
}
