/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
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

		browser = new Browser(wrapped, SWT.BORDER);
		Layouts.setGridData(browser).grabAll();

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
	}

	long setAt = Long.MIN_VALUE;
	private static final long QUIET_MS = 3_000;

	public void setToYoutubeId(String youtubeId) {
		setAt = System.currentTimeMillis();
		browser.setText(StringPrinter.buildStringFromLines("<html><body>\n" +
				"<div id=\"player\">...loading</div>\n" +
				"<script type=\"text/javascript\">\n" +
				"	var tag = document.createElement('script');\n" +
				"tag.src = \"https://www.youtube.com/iframe_api\";\n" +
				"var firstScriptTag = document.getElementsByTagName('script')[0];\n" +
				"firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);\n" +
				"var player;\n" +
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
				"var playerIsReady = false;\n" +
				"function onPlayerReady(event) {\n" +
				"	playerIsReady = true;\n" +
				"}\n" +
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
				"var duration = 0;\n" +
				"var play = function(start, end) {\n" +
				"	if (playerIsReady) {\n" +
				"		duration = end - start;\n" +
				"		if (duration < 1) {\n" +
				"			duration = 1;\n" +
				"		}\n" +
				"		player.seekTo(start);\n" +
				"		startTimer();\n" +
				"	} else {\n" +
				"		alert(\"player not ready, try again\");\n" +
				"	}\n" +
				"}\n" +
				"var timerId;\n" +
				"var secondsElapsed = -1;\n" +
				"function startTimer() {\n" +
				"	secondsElapsed += 1;\n" +
				"	if (secondsElapsed >= duration) {\n" +
				"		stopTimer();\n" +
				"		player.stopVideo();\n" +
				"	} else { \n" +
				"		timerId = window.setTimeout(startTimer, 1000);\n" +
				"	}\n" +
				"};\n" +
				"function stopTimer() {\n" +
				"	secondsElapsed = -1;\n" +
				"	if (timerId) {\n" +
				"		window.clearTimeout(timerId);\n" +
				"		timerId = null;\n" +
				"	}\n" +
				"};\n" +
				"</script>\n" +
				"</html></body>"));
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
