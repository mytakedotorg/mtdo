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


import com.diffplug.common.swt.Layouts;
import java.nio.file.Path;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.CTabFolder;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.mytake.factset.video.gui.Labels;

public class Workbench {
	private final FileTreeCtl fileTree;
	private final CTabFolder tabs;

	public Workbench(Composite parent, Path folder) {
		Layouts.setFill(parent);
		SashForm form = new SashForm(parent, SWT.HORIZONTAL);

		Composite fileeTreeCmp = new Composite(form, SWT.NONE);
		Layouts.setGrid(fileeTreeCmp).margin(0);
		Labels.createBold(fileeTreeCmp, "Ingredients");
		fileTree = new FileTreeCtl(fileeTreeCmp, folder.resolve("ingredients"));
		Layouts.setGridData(fileTree).grabAll();

		tabs = new CTabFolder(form, SWT.NONE);
		form.setWeights(new int[]{1, 3});
	}
}
