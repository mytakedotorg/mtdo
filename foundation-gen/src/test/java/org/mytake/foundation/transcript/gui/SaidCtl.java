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
import org.mytake.foundation.transcript.SaidTranscript;

public class SaidCtl extends ControlWrapper.AroundControl<Composite> {
	private final FileCtl fileCtl;
	private final Text styled;

	public SaidCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		fileCtl = new FileCtl(wrapped, "Said");
		Layouts.setGridData(fileCtl).grabHorizontal();

		styled = new Text(wrapped, SWT.MULTI | SWT.BORDER | SWT.V_SCROLL | SWT.WRAP);
		Layouts.setGridData(styled).grabAll();
	}

	public void setFile(File file, SaidTranscript said) {
		fileCtl.setFile(file);
		styled.setText(fileCtl.read());
	}
}
