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
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.jface.ColumnViewerFormat;
import com.diffplug.common.swt.jface.ViewerMisc;
import com.diffplug.common.tree.TreeDef;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;

public class FileTreeCtl extends ControlWrapper.AroundControl<Composite> {
	public FileTreeCtl(Composite parent, Path folder) {
		super(new Composite(parent, SWT.BORDER));

		// define the format of the tree
		ColumnViewerFormat<Path> format = ColumnViewerFormat.builder();
		format.setStyle(SWT.VIRTUAL).setHeaderVisible(false);
		format.addColumn().setText("Name").setLabelProviderText(path -> path.getFileName().toString());

		// create the tree viewer
		TreeViewer viewer = format.buildTree(wrapped);
		// define the structure of the tree's contents
		ViewerMisc.setLazyTreeContentProvider(viewer, new TreeDef.Parented<Path>() {
			@Override
			public List<Path> childrenOf(Path node) {
				if (!Files.isDirectory(node)) {
					return Collections.emptyList();
				}
				try (DirectoryStream<Path> stream = Files.newDirectoryStream(node, path -> !path.getFileName().toString().startsWith("."))) {
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
	}

	// files at top, folders at bottom, most-recent dates first
	private static Comparator<Path> ORDER = Comparator.<Path> comparingInt(path -> Files.isDirectory(path) ? 1 : 0)
			.thenComparing(path -> path.getFileName(), Comparator.reverseOrder());
}
