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
import org.eclipse.swt.browser.Browser;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;

public class YoutubeCtl extends ControlWrapper.AroundControl<Composite> {
	public YoutubeCtl(Composite parent, String youtubeId) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		Browser browser = new Browser(wrapped, SWT.BORDER);
		browser.setUrl("https://www.youtube.com/watch?v=" + youtubeId);
		Layouts.setGridData(browser).grabAll();
		//		Composite browser = new Composite(wrapped, SWT.BORDER);
		//		Layouts.setGridData(browser).grabAll();

		Composite bottomCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(bottomCmp).grabHorizontal();
		Layouts.setRow(bottomCmp).margin(0);

		Button checkBox = new Button(bottomCmp, SWT.CHECK);
		Label playOnClick = new Label(bottomCmp, SWT.NONE);
		playOnClick.setText("Play on click +/-");
		Text secondsTxt = new Text(bottomCmp, SWT.SINGLE | SWT.BORDER);
		secondsTxt.setText("0.0");
		Layouts.setRowData(secondsTxt).width(4 * SwtMisc.systemFontWidth());
		Label seconds = new Label(bottomCmp, SWT.NONE);
		seconds.setText("seconds");
	}
}
