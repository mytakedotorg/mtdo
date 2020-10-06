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
package org.mytake.factset.swt;


import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.os.OS;
import java.util.Locale;
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
	public static final int GRIND = CTRL | 'g';

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

	public static String uiStringFor(int accelerator) {
		if (accelerator == SWT.NONE) {
			return "<none>";
		}

		StringBuilder builder = new StringBuilder(16);
		builder.append('[');
		if (SwtMisc.flagIsSet(SWT.CTRL, accelerator)) {
			builder.append("Ctrl ");
			accelerator -= SWT.CTRL;
		}

		if (SwtMisc.flagIsSet(SWT.COMMAND, accelerator)) {
			builder.append(UC_CMD + " ");
			accelerator -= SWT.COMMAND;
		}

		if (SwtMisc.flagIsSet(SWT.ALT, accelerator)) {
			builder.append("Alt ");
			accelerator -= SWT.ALT;
		}

		if (SwtMisc.flagIsSet(SWT.SHIFT, accelerator)) {
			builder.append("Shift ");
			accelerator -= SWT.SHIFT;
		}

		final String end;

		if (SWT.F1 <= accelerator && accelerator <= SWT.F20) {
			int num = 1 + accelerator - SWT.F1;
			end = "F" + Integer.toString(num);
		} else {
			// spotless:off
			switch (accelerator) {
			case SWT.ARROW_UP:		end = UC_ARROW_UP;		break;
			case SWT.ARROW_DOWN:	end = UC_ARROW_DOWN;	break;
			case SWT.ARROW_LEFT:	end = UC_ARROW_LEFT;	break;
			case SWT.ARROW_RIGHT:	end = UC_ARROW_RIGHT;	break;
			case SWT.ESC:			end = "Esc";			break;
			case SWT.SPACE:			end = "Spacebar";		break;
			default:
				end = Character.toString((char) accelerator).toUpperCase(Locale.ROOT);
				break;
			}
			// spotless:on
		}
		builder.append(end);
		builder.append(']');
		return builder.toString();
	}

	/** Unicode for arrows. */
	private static final String UC_ARROW_UP = "\u2191";
	private static final String UC_ARROW_DOWN = "\u2193";
	private static final String UC_ARROW_LEFT = "\u2190";
	private static final String UC_ARROW_RIGHT = "\u2192";
	/** Unicode for the Mac cmd icon. */
	private static final String UC_CMD = "\u2318";
}
