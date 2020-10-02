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


import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtMisc;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;
import org.mytake.factset.gui.Labels;

/** One-off tool to play back videos with an offset. */
public class _MiscMultiVideoSync {
	final YoutubeCtl before, after;
	final Text beforeTxt, afterTxt;
	final Text offsetTxt, playAtTxt, playDurTxt;

	private _MiscMultiVideoSync(Composite parent) {
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
			_MiscMultiVideoSync sync = new _MiscMultiVideoSync(cmp);
			sync.setYoutubeIds("hb1AvG18H30", "CsurHThBBkk");
		}).setTitle("Sync videos")
				.setSize(SwtMisc.scaleByFontHeight(70, 25))
				.openOnDisplayBlocking();
	}
}
