/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.fact.transcript.gui;

import com.diffplug.common.swt.Fonts;
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

	/** Creates a bold label with the given text. */
	public static void createBold(Composite parent, String text) {
		Label lbl = create(parent, text);
		lbl.setFont(Fonts.systemBold());
	}
}
