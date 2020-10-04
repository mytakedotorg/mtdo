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


import com.diffplug.common.swt.Corner;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import java.util.ArrayList;
import java.util.List;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Control;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Menu;
import org.eclipse.swt.widgets.MenuItem;
import org.eclipse.swt.widgets.Tree;
import org.eclipse.swt.widgets.TreeItem;

public class ContextMenu {
	private final List<String> txts = new ArrayList<>();
	private final List<Runnable> actions = new ArrayList<>();

	public void addItem(String txt, Runnable action) {
		txts.add(txt);
		actions.add(action);
	}

	public void openAt(Event e) {
		if (e.widget instanceof Tree) {
			Tree tree = (Tree) e.widget;
			TreeItem item = tree.getItem(new Point(e.x, e.y));
			if (item == null) {
				openAt(tree, e.x, e.y);
			} else {
				openOnItem(item);
			}
		}
	}

	private void openAt(Control parent, int x, int y) {
		Menu menu = create(parent);
		menu.setLocation(parent.toDisplay(x, y));
		menu.setVisible(true);
	}

	private void openOnItem(TreeItem item) {
		Point bottomLeft = Corner.BOTTOM_LEFT.getPosition(SwtMisc.toDisplay(item.getParent(), item.getBounds()));
		bottomLeft.y += Layouts.defaultMargin();
		Menu menu = create(item.getParent());
		menu.setLocation(bottomLeft);
		menu.setVisible(true);
	}

	private Menu create(Control parent) {
		Menu menu = new Menu(parent);
		for (int i = 0; i < txts.size(); ++i) {
			MenuItem item = new MenuItem(menu, SWT.PUSH);
			item.setText(txts.get(i));
			Runnable action = actions.get(i);
			item.addListener(SWT.Selection, e -> action.run());
		}
		return menu;
	}
}
