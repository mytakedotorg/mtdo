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
package org.mytake.factset.swt.video;


import com.diffplug.common.io.Files;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.mytake.factset.swt.Labels;
import org.mytake.factset.swt.Workbench;
import org.mytake.factset.video.Ingredients;
import org.mytake.factset.video.TranscriptMatch;

public class TranscriptCtl extends ControlWrapper.AroundControl<Composite> {
	private final SaidCtl saidCtl;
	private final VttCtl vttCtl;
	private final YoutubeCtl youtubeCtl;
	private final MismatchCtl mismatchCtl;

	public static TranscriptCtl createPane(Composite parent, Workbench.Pane pane) {
		return new TranscriptCtl(parent, pane);
	}

	TranscriptCtl(Composite parent, Workbench.Pane pane) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped);
		SashForm horizontalForm = new SashForm(wrapped, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		saidCtl = new SaidCtl(horizontalForm);

		Composite rightSide = new Composite(horizontalForm, SWT.NONE);
		Layouts.setGrid(rightSide).margin(0).spacing(0);
		Labels.createBold(rightSide, "YouTube");

		SashForm verticalForm = new SashForm(rightSide, SWT.VERTICAL);
		Layouts.setGridData(verticalForm).grabAll();
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm, youtubeCtl, pane);

		mismatchCtl = new MismatchCtl(wrapped, saidCtl, vttCtl, youtubeCtl, pane);
		Layouts.setGridData(mismatchCtl).grabHorizontal();
	}

	private TranscriptMatch match;

	public void setTo(TranscriptMatch match) {
		this.match = match;
		youtubeCtl.setToYoutubeId(match.meta().youtubeId);
		saidCtl.setFile(match.said());
		vttCtl.setFile(match);
		mismatchCtl.setMatch(match);
	}

	public void save(Ingredients folder, String transcript) throws IOException {
		int sizeBefore = match.vtt().lines().size();
		String before = match.vtt().asString();
		match = match.save(folder, transcript, vttCtl.getWords(), saidCtl.getText());
		int sizeAfter = match.vtt().lines().size();

		if (sizeBefore != sizeAfter) {
			// if the size changed, ask the user to take a peek
			File vtt = folder.fileVtt(transcript);
			File backup = new File(vtt.getAbsolutePath() + ".backup-" + new SimpleDateFormat("HH_mm_ss").format(System.currentTimeMillis()));
			SwtMisc.blockForError("Save might have failed!",
					"It's possible that this save just corrupted the .vtt file.\n" +
							"The content right before the save is in '" + backup.getAbsolutePath() + "'.\n" +
							"Compare the current vtt against this backup to make sure it wasn't corrupted.\n" +
							"If it wasn't corrupted, just delete the backup.\n\n" +
							"Exiting, just start again after you have checked.");
			Files.write(before.getBytes(StandardCharsets.UTF_8), backup);
			mismatchCtl.getShell().dispose();
			System.exit(1);
		}
		mismatchCtl.setMatch(match);
	}
}
