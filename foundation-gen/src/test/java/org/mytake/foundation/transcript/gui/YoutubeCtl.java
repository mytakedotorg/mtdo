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
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Resources;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import org.eclipse.swt.SWT;
import org.eclipse.swt.SWTException;
import org.eclipse.swt.widgets.Composite;

public class YoutubeCtl extends ControlWrapper.AroundControl<Composite> {
	private final BrowserShim browser;

	public YoutubeCtl(Composite parent) {
		super(new Composite(parent, SWT.BORDER));
		Layouts.setFill(wrapped).margin(0);
		browser = BrowserShim.create(wrapped, SWT.NONE);
	}

	long setAt = Long.MIN_VALUE;

	public void setToYoutubeId(String youtubeId) {
		loadBeganAt = System.currentTimeMillis();
		try {
			URL url = YoutubeCtl.class.getResource("/org/mytake/foundation/transcript/youtubectl.html");
			String tempate = Resources.toString(url, StandardCharsets.UTF_8);
			String content = tempate.replace("HZ_r26R-cUo", youtubeId);
			browser.setText(content);
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
		if (allowed && (System.currentTimeMillis() - loadBeganAt > LOAD_MS)) {
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

	private static final long LOAD_MS = 3_000;
	private long loadBeganAt = Long.MIN_VALUE;

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
