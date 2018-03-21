/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;

public class MismatchCtl extends ControlWrapper.AroundControl<Composite> {
	private final Text groupTxt;
	private final Label ofGroupLbl;
	private final Text speakersTxt;
	private final Text vttTxt;

	public MismatchCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0).numColumns(3);

		Composite leftCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGrid(leftCmp).margin(0).numColumns(3);

		Button leftBtn = new Button(leftCmp, SWT.ARROW | SWT.LEFT);
		groupTxt = new Text(leftCmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(groupTxt).widthHint(5 * SwtMisc.systemFontWidth());
		Button rightBtn = new Button(leftCmp, SWT.ARROW | SWT.RIGHT);

		ofGroupLbl = new Label(leftCmp, SWT.CENTER);
		ofGroupLbl.setText("of 1456");
		Layouts.setGridData(ofGroupLbl).horizontalSpan(3).grabHorizontal();

		Button highlightBtn = new Button(wrapped, SWT.PUSH | SWT.FLAT);
		highlightBtn.setText("Highlight");
		Layouts.setGridData(highlightBtn).grabVertical();

		Composite rightCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(rightCmp).grabAll();
		Layouts.setGrid(rightCmp).numColumns(2).margin(0);

		Labels.create(rightCmp, "Speakers");
		speakersTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(speakersTxt).grabHorizontal();

		Labels.create(rightCmp, "VTT");
		vttTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(vttTxt).grabHorizontal();
	}
}
