/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.os.OS;
import org.eclipse.swt.browser.Browser;
import org.eclipse.swt.widgets.Composite;

/** Shim for the few browser APIs we need. */
public interface BrowserShim extends ControlWrapper {
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
