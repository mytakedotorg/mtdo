/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Resources;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.eclipse.swt.SWT;
import org.eclipse.swt.browser.Browser;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;

public class YoutubeCtl extends ControlWrapper.AroundControl<Composite> {
	private final Browser browser;
	private final Button checkBox;
	private final Text secondsTxt;

	public YoutubeCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		Composite bottomCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(bottomCmp).grabHorizontal();
		Layouts.setRow(bottomCmp).margin(0);

		checkBox = new Button(bottomCmp, SWT.CHECK);
		checkBox.setSelection(true);
		Labels.create(bottomCmp, "Play on click +/-");
		secondsTxt = new Text(bottomCmp, SWT.SINGLE | SWT.BORDER);
		secondsTxt.setText("1.0");
		Layouts.setRowData(secondsTxt).width(4 * SwtMisc.systemFontWidth());
		Labels.create(bottomCmp, "seconds");

		Button playAgain = new Button(bottomCmp, SWT.PUSH);
		playAgain.setText("Play again");
		playAgain.addListener(SWT.Selection, e -> {
			play(start, end);
		});

		browser = new Browser(wrapped, SWT.BORDER);
		Layouts.setGridData(browser).grabAll();
	}

	long setAt = Long.MIN_VALUE;
	private static final long QUIET_MS = 3_000;

	public void setToYoutubeId(String youtubeId) {
		setAt = System.currentTimeMillis();
		try {
			URL url = YoutubeCtl.class.getResource("/org/mytake/foundation/transcript/youtubectl.html");
			String content = Resources.toString(url, StandardCharsets.UTF_8);
			browser.setText(content.replace("HZ_r26R-cUo", youtubeId));
		} catch (Exception e) {
			Errors.dialog().accept(e);
		}
	}

	private double start, end;

	/** Plays the given clip in the youtube player. */
	public void play(double start, double end) {
		this.start = start;
		this.end = end;
		if (System.currentTimeMillis() - setAt < QUIET_MS) {
			return;
		}
		double seconds = Double.parseDouble(secondsTxt.getText());
		boolean playIsEnabled = checkBox.getSelection();
		if (playIsEnabled) {
			start -= seconds;
			end += seconds;
			browser.evaluate("play(" + start + ", " + end + ");");
		}
	}
}
