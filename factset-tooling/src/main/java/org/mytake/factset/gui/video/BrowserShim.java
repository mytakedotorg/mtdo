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
package org.mytake.factset.gui.video;


import com.diffplug.common.base.Errors;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.os.OS;
import org.eclipse.swt.browser.Browser;
import org.eclipse.swt.widgets.Composite;

/** Shim for the few browser APIs we need. */
interface BrowserShim extends ControlWrapper {
	public static BrowserShim create(Composite parent, int style) {
		if (OS.getNative().isWindows()) {
			try {
				@SuppressWarnings("unchecked")
				Class<? extends BrowserShim> clazz = (Class<? extends BrowserShim>) Class.forName("org.mytake.foundation.transcript.gui.ChromiumShim");
				return clazz.getConstructor(Composite.class, int.class).newInstance(parent, style);
			} catch (Exception e) {
				throw Errors.asRuntime(e);
			}
		} else {
			return new SwtShim(parent, style);
		}
	}

	void setText(String content);

	void evaluate(String string);

	/** The built-in SWT browser (IE on windows, which is terribly broken). */
	static class SwtShim extends ControlWrapper.AroundControl<Browser> implements BrowserShim {
		public SwtShim(Composite parent, int style) {
			super(new Browser(parent, style));
		}

		@Override
		public void setText(String content) {
			wrapped.setText(content);
		}

		@Override
		public void evaluate(String script) {
			wrapped.evaluate(script);
		}
	}
}
