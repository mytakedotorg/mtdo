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
import com.diffplug.common.swt.jface.ColumnViewerFormat;
import java.io.File;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.WordTime;

public class VttCtl extends ControlWrapper.AroundControl<Composite> {
	private final FileCtl fileCtl;
	private final Button addBtn;
	private final Text addTxt;

	public VttCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		fileCtl = new FileCtl(wrapped, "VTT");
		Layouts.setGridData(fileCtl).grabHorizontal();

		Composite tableCmp = new Composite(wrapped, SWT.BORDER);
		Layouts.setGridData(tableCmp).grabAll();

		Composite bottomCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(bottomCmp).grabHorizontal();
		Layouts.setGrid(bottomCmp).margin(0).numColumns(2);
		addBtn = new Button(bottomCmp, SWT.PUSH | SWT.FLAT);
		addBtn.setText("Add below selection");
		addTxt = new Text(bottomCmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(addTxt).grabHorizontal();

		ColumnViewerFormat<WordTime> time = ColumnViewerFormat.builder();
		time.addColumn().setText("Time").setLabelProviderText(word -> String.format("%.3f", word.time())).setLayoutPixel(6 * SwtMisc.systemFontWidth());
		time.addColumn().setText("Word").setLabelProviderText(word -> word.lowercase()).setLayoutWeight(1);
		time.setHeaderVisible(true);
		time.setLinesVisible(true);
		time.setUseHashLookup(true);
		time.setStyle(SWT.SINGLE | SWT.VIRTUAL);
		time.buildTable(tableCmp);
	}

	public void setFile(File file) {
		fileCtl.setFile(file);
		// TODO: load file and setup viewer
	}
}
