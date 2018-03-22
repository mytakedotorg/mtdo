/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;

public class Labels {
	/** Creates a label with the given text. */
	public static Label create(Composite parent, String text) {
		Label lbl = new Label(parent, SWT.WRAP);
		lbl.setText(text);
		return lbl;
	}

	/** Creates a label with the given text. */
	public static Label createVSep(Composite parent) {
		return new Label(parent, SWT.SEPARATOR | SWT.VERTICAL);
	}

	/** Creates a label with the given text. */
	public static Label createHSep(Composite parent) {
		return new Label(parent, SWT.SEPARATOR | SWT.HORIZONTAL);
	}
}
