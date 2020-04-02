/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import org.eclipse.swt.chromium.Browser;
import org.eclipse.swt.widgets.Composite;

/** Chromium-based shim for use on windows. */
public class ChromiumShim extends ControlWrapper.AroundControl<Browser> implements BrowserShim {
	public ChromiumShim(Composite parent, int style) {
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
