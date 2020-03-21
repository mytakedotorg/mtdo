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
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.eclipse.swt.SWT;
import org.eclipse.swt.SWTException;
import org.eclipse.swt.browser.Browser;
import org.eclipse.swt.widgets.Composite;

public class YoutubeCtl extends ControlWrapper.AroundControl<Composite> {
	private final Browser browser;

	public YoutubeCtl(Composite parent) {
		super(new Composite(parent, SWT.BORDER));
		Layouts.setFill(wrapped).margin(0);

		browser = new Browser(wrapped, SWT.NONE);
	}

	long setAt = Long.MIN_VALUE;

	public void setToYoutubeId(String youtubeId) {
		try {
			URL url = YoutubeCtl.class.getResource("/org/mytake/foundation/transcript/youtubectl.html");
			String content = Resources.toString(url, StandardCharsets.UTF_8);
			browser.setText(content.replace("HZ_r26R-cUo", youtubeId));
		} catch (Exception e) {
			Errors.dialog().accept(e);
		}
	}

	private boolean allowed = true;
	private double lastStart, lastEnd;

	/** Plays the given clip in the youtube player. */
	public void play(double start, double end) {
		this.lastStart = start;
		this.lastEnd = end;
		if (allowed) {
			try {
				browser.evaluate("play(" + start + ", " + end + ");");
			} catch (Exception e) {
				if (e instanceof SWTException && e.getMessage().equals("Can't find variable: play")) {
					// ignore, just because we called too close to load
				} else {
					Errors.dialog().accept(e);
				}
			}
		}
	}

	public void setPlayAllowed(boolean allowed) {
		this.allowed = allowed;
	}

	public double lastStart() {
		return lastStart;
	}

	public double lastEnd() {
		return lastEnd;
	}
}
