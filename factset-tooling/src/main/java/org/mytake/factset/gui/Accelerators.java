/*
 * MyTake.org website and tooling.
 * Copyright (C) 2011-2020 MyTake.org, Inc.
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


import com.diffplug.common.swt.jface.Actions;
import com.diffplug.common.swt.os.OS;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Event;

/** Keeps track of accelerator keys. */
public class Accelerators {
	/** Code for the absence of any accelerators. */
	public static final int NO_ACCELERATOR = 0;

	public static final int CTRL = OS.getNative().isMac() ? SWT.COMMAND : SWT.CTRL;

	public static final int SEARCH = CTRL | 'f';

	public static final int CUT = CTRL | 'x';
	public static final int COPY = CTRL | 'c';
	public static final int PASTE = CTRL | 'v';

	public static final int UNDO = CTRL | 'z';
	public static final int REDO = OS.getNative().isMac() ? (CTRL | SWT.SHIFT | 'z') : (CTRL | 'y');

	public static final int SELECT_ALL = CTRL | 'a';
	public static final int SAVE = CTRL | 's';

	/** An action which automatically appends the accelerator code to the tooltip text. */
	public static class Action extends org.eclipse.jface.action.Action {
		private final int accelerator;

		/** Make an action with the given type. */
		public Action(String name, int style, int accelerator) {
			super(name, style);
			this.accelerator = accelerator;
			init();
		}

		/** Make an action with the default pushbutton type. */
		public Action(String name, int accelerator) {
			this(name, AS_PUSH_BUTTON, accelerator);
		}

		/** Sets the text for this Action. */
		@Override
		public void setText(String text) {
			super.setText(text);
			init();
		}

		private void init() {
			super.setAccelerator(accelerator);
			super.setToolTipText(getText() + " [" + Actions.getAcceleratorString(accelerator) + "]");
		}

		/** Automatically add the accelerator text. */
		@Override
		public void setToolTipText(String text) {
			super.setToolTipText(text + " [" + Actions.getAcceleratorString(accelerator) + "]");
		}

		/** Disable changing the accelerator after the fact. */
		@Override
		public void setAccelerator(int accelerator) {
			throw new UnsupportedOperationException();
		}
	}

	public static boolean isDelete(Event e) {
		return e.keyCode == SWT.DEL || e.keyCode == SWT.BS;
	}

	public static boolean isEnter(Event e) {
		return e.keyCode == SWT.CR || e.keyCode == SWT.LF;
	}

	/** Returns true if the given keycode is contained within the event. */
	public static boolean checkKey(Event e, int code) {
		return (e.keyCode | e.stateMask) == code;
	}
}