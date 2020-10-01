/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.factset.gui;


import com.diffplug.common.base.Box;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Fonts;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtExec;
import java.util.Collection;
import java.util.function.Consumer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.StyledText;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.Font;
import org.eclipse.swt.widgets.Composite;

/**
 * A widget that mimics a console. Supports carriage returns.
 */
class Console extends ControlWrapper.AroundControl<Composite> {
	/** Creates a `Console` which wraps. */
	public static Console wrapping(Composite parent) {
		return new Console(parent, true);
	}

	/** Creates a `Console`  which does not wrap. */
	public static Console nonWrapping(Composite parent) {
		return new Console(parent, false);
	}

	private final StyledText text;

	/** Constructor for creating Console. */
	protected Console(Composite parent, boolean wrap) {
		super(new Composite(parent, SWT.BORDER));
		Layouts.setFill(wrapped).margin(0);
		text = new StyledText(wrapped, (wrap ? SWT.WRAP : SWT.H_SCROLL) | SWT.MULTI | SWT.READ_ONLY | SWT.V_SCROLL);
		text.setBackground(text.getDisplay().getSystemColor(SWT.COLOR_WHITE));
		text.setFont(Fonts.systemMonospace());
	}

	private Box<Boolean> killSwitch = Box.ofVolatile(false);

	/** Wipes the contents of the text box and returns a new {@link StringPrinter} to write to. Thread-safe. */
	public StringPrinter wipeAndCreateNewStream() {
		// send the "wipe" command
		batcher.addToQueue(null);
		// and silence our current printer
		killSwitch.set(true);

		// create a new stream and send it along
		Box<Boolean> closureKillSwitch = Box.ofVolatile(false);

		// so long we haven't been killed, add whatever is printed to the batcher
		StringPrinter printer = new StringPrinter(str -> {
			if (!closureKillSwitch.get()) {
				batcher.addToQueue(str);
			}
		});

		// keep the handle to our new kill switch
		killSwitch = closureKillSwitch;

		// and return the StringPrinter which we created
		return printer;
	}

	private static final String NEWLINE = "\n";
	private static final String CARRIAGE_RETURN = "\r";
	private static final String FORM_FEED = "\f";

	/** The batcher that aggregates the results of the StringPrinter. */
	private Batcher<String> batcher = new Batcher<String>(SwtExec.async(), new Consumer<Collection<String>>() {
		private StringBuilder buffer = new StringBuilder();
		private String oldContent = "";

		@Override
		public void accept(Collection<String> objs) {
			if (text.isDisposed()) {
				return;
			}

			for (String obj : objs) {
				// append the text
				if (obj == null) {
					// codes for wipe
					buffer.setLength(0);
				} else {
					obj = obj.replace("\r\n", "\n");
					// clear on form-feed
					int lastIdx = obj.lastIndexOf(FORM_FEED);
					if (lastIdx >= 0) {
						buffer.setLength(0);
						obj = obj.substring(lastIdx + 1);
					}

					// record the previous length of the buffer
					int startIdx = buffer.length();
					// add it to the buffer
					buffer.append(obj);

					// look for the carriage return
					int carriageIdx = buffer.indexOf(CARRIAGE_RETURN, startIdx);
					while (carriageIdx >= 0) {
						// find the first newline before this carriage return
						int prevNewline = buffer.lastIndexOf(NEWLINE, carriageIdx);
						// replace everything after the newline, up to and including the carriage return
						buffer.replace(prevNewline + 1, carriageIdx + 1, "");
						// update the startIdx based on the removal
						startIdx -= carriageIdx - prevNewline;

						// update for the next loop
						carriageIdx = buffer.indexOf(CARRIAGE_RETURN, startIdx);
					}
				}
			}

			// set the text and do the scroll
			String newContent = buffer.toString();
			if (newContent.startsWith(oldContent)) {
				text.append(newContent.substring(oldContent.length()));
			} else {
				text.setText(newContent);
			}
			oldContent = newContent;
			text.setTopIndex(text.getLineCount() - 1);
		}
	});

	/** Sets the background color of the console. */
	public void setBackground(Color color) {
		text.setBackground(color);
	}

	/** Sets the font of the console. */
	public void setFont(Font font) {
		text.setFont(font);
	}
}
