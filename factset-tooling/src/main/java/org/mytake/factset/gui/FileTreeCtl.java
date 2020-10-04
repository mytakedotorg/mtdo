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


import com.diffplug.common.base.Box;
import com.diffplug.common.base.Errors;
import com.diffplug.common.collect.ImmutableList;
import com.diffplug.common.collect.Iterables;
import com.diffplug.common.rx.RxBox;
import com.diffplug.common.swt.ControlWrapper;
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
import javax.annotation.Nullable;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Menu;
import org.eclipse.swt.widgets.MenuItem;
import org.eclipse.swt.widgets.Text;

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
				Menu menu = new Menu(viewer.getTree());
				menu.setLocation(e.x, e.y);
				rightClick(menu, selection.get());
				menu.setVisible(true);
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
	private void rightClick(Menu menu, ImmutableList<Path> paths) {
		if (paths.isEmpty()) {
			addItem(menu, "Create file", () -> Kind.FILE.createChild(this, root));
			addItem(menu, "Create folder", () -> Kind.FOLDER.createChild(this, root));
		} else if (paths.size() == 1) {
			Path path = paths.get(0);
			if (Files.isDirectory(path)) {
				addItem(menu, "Create child file", () -> Kind.FILE.createChild(this, path));
				addItem(menu, "Create child folder", () -> Kind.FOLDER.createChild(this, path));
			}
			addItem(menu, "Delete", () -> delete(Collections.singleton(path)));
			addItem(menu, "Rename", () -> rename(path));
		} else {
			addItem(menu, "Delete", () -> delete(paths));
			if (paths.stream().allMatch(Files::isRegularFile)) {
				Set<String> commonNames = paths.stream()
						.map(path -> {
							String filename = path.getFileName().toString();
							int lastDot = filename.lastIndexOf('.');
							return lastDot == -1 ? filename : filename.substring(0, lastDot);
						}).collect(Collectors.toSet());
				if (commonNames.size() == 1) {
					addItem(menu, "Rename all", () -> renameAll(paths, Iterables.getOnlyElement(commonNames)));
				}
			}
		}
	}

	private void delete(Collection<Path> paths) {
		if (!SwtMisc.blockForQuestion("Confirm delete", "Are you sure you want to delete:\n" +
				paths.stream().map(p -> root.relativize(p).toString()).collect(Collectors.joining("\n")))) {
			Errors.dialog().run(() -> {
				for (Path path : paths) {
					Files.delete(path);
				}
				refresh();
			});
		}
	}

	private void rename(Path path) {
		String name = nameDialog("Rename " + path.getFileName(), path.getFileName().toString());
		if (name != null) {
			Errors.dialog().run(() -> {
				Path newName = path.getParent().resolve(name);
				Files.move(path, newName);
				refresh();
			});
		}
	}

	private void renameAll(Collection<Path> paths, String commonName) {
		String name = nameDialog("Rename " + commonName, commonName);
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
			String name = nameDialog("New " + name().toLowerCase(Locale.ROOT), "");
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

	private static @Nullable String nameDialog(String operation, String start) {
		Box.Nullable<String> result = Box.Nullable.ofNull();
		Shells.builder(SWT.APPLICATION_MODAL, cmp -> {
			Layouts.setGrid(cmp);
			Labels.create(cmp, operation + " " + start);
			Text txt = new Text(cmp, SWT.SINGLE | SWT.BORDER);
			Layouts.setGridData(txt).grabHorizontal();
			txt.setText(start);
			RxBox<String> txtStr = SwtRx.textImmediate(txt);

			ButtonPanel panel = ButtonPanel.builder()
					.add(operation, () -> {
						result.set(txtStr.get());
						cmp.getShell().dispose();
					}).add("Cancel", () -> {
						cmp.getShell().dispose();
					}).build(cmp);
			Layouts.setGridData(panel).grabHorizontal();
		})
				.setSize(SwtMisc.defaultDialogWidth(), SWT.DEFAULT)
				.openOnActiveBlocking();
		return result.get();
	}

	private void addItem(Menu menu, String txt, Runnable onClick) {
		MenuItem add = new MenuItem(menu, SWT.PUSH);
		add.setText(txt);
		add.addListener(SWT.Selection, e -> onClick.run());
	}

	private void refresh() {
		Object[] expanded = viewer.getVisibleExpandedElements();
		viewer.refresh();
		viewer.setExpandedElements(expanded);
	}
}
