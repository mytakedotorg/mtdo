/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2018 MyTake.org, Inc.
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

import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtMisc;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;

/** Tool to play back videos with an offset. */
public class MultiVideoSync {
	final YoutubeCtl before, after;
	final Text beforeTxt, afterTxt;
	final Text offsetTxt, playAtTxt, playDurTxt;

	private MultiVideoSync(Composite parent) {
		Layouts.setGrid(parent).numColumns(2);
		before = new YoutubeCtl(parent);
		after = new YoutubeCtl(parent);
		Layouts.setGridData(before).grabAll();
		Layouts.setGridData(after).grabAll();
		Composite bottom = new Composite(parent, SWT.NONE);
		Layouts.setGridData(bottom).horizontalSpan(2).grabHorizontal();
		Layouts.setRow(bottom).margin(0);

		int idLength = 10 * SwtMisc.systemFontWidth();
		Labels.create(bottom, "Before");
		beforeTxt = new Text(bottom, SWT.SINGLE | SWT.BORDER);
		Layouts.setRowData(beforeTxt).width(idLength);
		beforeTxt.addListener(SWT.FocusOut, e -> {
			before.setToYoutubeId(beforeTxt.getText());
		});

		Labels.create(bottom, "After");
		afterTxt = new Text(bottom, SWT.SINGLE | SWT.BORDER);
		Layouts.setRowData(afterTxt).width(idLength);
		afterTxt.addListener(SWT.FocusOut, e -> {
			after.setToYoutubeId(afterTxt.getText());
		});

		Labels.create(bottom, "t_before + X = t_after");
		offsetTxt = new Text(bottom, SWT.SINGLE | SWT.BORDER);
		Layouts.setRowData(offsetTxt).width(5 * SwtMisc.systemFontWidth());

		Button playBtn = new Button(bottom, SWT.PUSH);
		playBtn.setText("Play");

		Labels.create(bottom, "From");
		playAtTxt = new Text(bottom, SWT.SINGLE | SWT.BORDER);
		Layouts.setRowData(playAtTxt).width(5 * SwtMisc.systemFontWidth());

		Labels.create(bottom, "Duration");
		playDurTxt = new Text(bottom, SWT.SINGLE | SWT.BORDER);
		Layouts.setRowData(playDurTxt).width(5 * SwtMisc.systemFontWidth());

		playBtn.addListener(SWT.Selection, e -> {
			double from = Double.parseDouble(playAtTxt.getText());
			double duration = Double.parseDouble(playDurTxt.getText());
			before.play(from, from + duration);
			double offset = Double.parseDouble(offsetTxt.getText());
			after.play(from + offset, from + offset + duration);
		});
	}

	private void setYoutubeIds(String beforeYoutube, String afterYoutube) {
		beforeTxt.setText(beforeYoutube);
		before.setToYoutubeId(beforeYoutube);
		afterTxt.setText(afterYoutube);
		after.setToYoutubeId(afterYoutube);
	}

	public static void main(String[] args) {
		Shells.builder(SWT.SHELL_TRIM, cmp -> {
			MultiVideoSync sync = new MultiVideoSync(cmp);
			sync.setYoutubeIds("hb1AvG18H30", "CsurHThBBkk");
		}).setTitle("Sync videos")
				.setSize(SwtMisc.scaleByFontHeight(70, 25))
				.openOnDisplayBlocking();
	}
}
