/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.gui.video;


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
