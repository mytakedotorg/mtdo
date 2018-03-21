/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import java.io.File;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;

public class SpeakersCtl extends ControlWrapper.AroundControl<Composite> {
	private final FileCtl fileCtl;
	private final Text styled;

	public SpeakersCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		fileCtl = new FileCtl(wrapped, "Speakers");
		Layouts.setGridData(fileCtl).grabHorizontal();

		styled = new Text(wrapped, SWT.MULTI | SWT.BORDER | SWT.V_SCROLL | SWT.WRAP);
		Layouts.setGridData(styled).grabAll();
	}

	public void setFile(File file) {
		fileCtl.setFile(file);
		// load file and set text
	}
}
