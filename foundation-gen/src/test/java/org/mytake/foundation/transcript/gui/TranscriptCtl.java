/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.io.Files;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import io.reactivex.subjects.PublishSubject;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.mytake.foundation.transcript.TranscriptFolder;
import org.mytake.foundation.transcript.TranscriptMatch;

public class TranscriptCtl extends ControlWrapper.AroundControl<Composite> {
	private final SaidCtl saidCtl;
	private final VttCtl vttCtl;
	private final YoutubeCtl youtubeCtl;
	private final MismatchCtl mismatchCtl;

	public TranscriptCtl(Composite parent, PublishSubject<Boolean> changed, Runnable save) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped);
		SashForm horizontalForm = new SashForm(wrapped, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		saidCtl = new SaidCtl(horizontalForm, changed);

		SashForm verticalForm = new SashForm(horizontalForm, SWT.VERTICAL);
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm, youtubeCtl, changed);

		mismatchCtl = new MismatchCtl(wrapped, saidCtl, vttCtl, youtubeCtl, changed, save);
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

	public void save(TranscriptFolder folder, String transcript) throws IOException {
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
