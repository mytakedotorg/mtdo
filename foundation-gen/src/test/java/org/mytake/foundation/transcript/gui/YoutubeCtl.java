/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Fonts;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import org.eclipse.swt.SWT;
import org.eclipse.swt.browser.Browser;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;

public class YoutubeCtl extends ControlWrapper.AroundControl<Composite> {
	private final Text idTxt;
	private final Button idBtn;
	private final Browser browser;
	private final Button checkBox;
	private final Text secondsTxt;

	public YoutubeCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		Composite header = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(header).grabHorizontal();
		Layouts.setGrid(header).margin(0).numColumns(3);
		Labels.create(header, "YouTube ID").setFont(Fonts.systemBold());
		idTxt = new Text(header, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(idTxt).grabHorizontal();
		idBtn = new Button(header, SWT.PUSH | SWT.FLAT);
		idBtn.setText("Set");
		idBtn.addListener(SWT.Selection, e -> {
			setToYoutubeId(idTxt.getText());
		});
		idTxt.addListener(SWT.Modify, e -> {
			idBtn.setEnabled(true);
		});

		browser = new Browser(wrapped, SWT.BORDER);
		Layouts.setGridData(browser).grabAll();

		Composite bottomCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(bottomCmp).grabHorizontal();
		Layouts.setRow(bottomCmp).margin(0);

		checkBox = new Button(bottomCmp, SWT.CHECK);
		checkBox.setSelection(true);
		Labels.create(bottomCmp, "Play on click +/-");
		secondsTxt = new Text(bottomCmp, SWT.SINGLE | SWT.BORDER);
		secondsTxt.setText("0.0");
		Layouts.setRowData(secondsTxt).width(4 * SwtMisc.systemFontWidth());
		Labels.create(bottomCmp, "seconds");
	}

	long setAt = Long.MIN_VALUE;
	private static final long QUIET_MS = 3_000;

	public void setToYoutubeId(String youtubeId) {
		setAt = System.currentTimeMillis();
		idTxt.setText(youtubeId);
		idBtn.setEnabled(false);
		browser.setText(StringPrinter.buildStringFromLines(
				"<div id=\"player\"></div>\n" +
						"<script>\n" +
						"	var tag = document.createElement('script');\n" +
						"\n" +
						"tag.src = \"https://www.youtube.com/iframe_api\";\n" +
						"var firstScriptTag = document.getElementsByTagName('script')[0];\n" +
						"firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);\n" +
						"\n" +
						"var player;\n" +
						"\n" +
						"function onYouTubeIframeAPIReady() {\n" +
						"	player = new YT.Player('player', {\n" +
						"		height: '390',\n" +
						"		width: '640',\n" +
						"		videoId: '" + youtubeId + "',\n" +
						"		events: {\n" +
						"			'onReady': onPlayerReady,\n" +
						"			'onStateChange': onPlayerStateChange\n" +
						"		}\n" +
						"	});\n" +
						"}\n" +
						"\n" +
						"var playerIsReady = false;\n" +
						"var secondsElapsed = 0;\n" +
						"function onPlayerReady(event) {\n" +
						"	playerIsReady = true;\n" +
						"}\n" +
						"\n" +
						"function onPlayerStateChange(event) { \n" +
						"	if (event.data === 0) {\n" +
						"		// Video ended\n" +
						"		stopTimer();\n" +
						"		secondsElapsed = 0;\n" +
						"	} else if (event.data === 1) {\n" +
						"		// Video playing\n" +
						"		startTimer();\n" +
						"	} else if (event.data === 2) {\n" +
						"		// Video paused\n" +
						"		stopTimer();\n" +
						"	} else if (event.data === 3) {\n" +
						"		// Video buffering\n" +
						"		stopTimer();\n" +
						"	}\n" +
						"}\n" +
						"\n" +
						"var endTime = 0;\n" +
						"var play = function(start, end) {\n" +
						"	if (playerIsReady) {\n" +
						"		endTime = end;\n" +
						"		player.playVideo();\n" +
						"	} else {\n" +
						"		alert(\"player not ready, try again\");\n" +
						"	}\n" +
						"}\n" +
						"\n" +
						"function startTimer() {\n" +
						"	secondsElapsed += 1;\n" +
						"	if (secondsElapsed >= endTime) {\n" +
						"		stopTimer();\n" +
						"		player.stopVideo();\n" +
						"	}\n" +
						"	timerId = window.setTimeout(startTimer, 1000);\n" +
						"};\n" +
						"stopTimer = () => {\n" +
						"	if (timerId) {\n" +
						"		window.clearTimeout(timerId);\n" +
						"		timerId = null;\n" +
						"	}\n" +
						"};\n" +
						"</script>"));
	}

	/** Plays the given clip in the youtube player. */
	public void play(double start, double end) {
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
