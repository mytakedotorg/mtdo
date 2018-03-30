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
import java.io.IOException;
import java.nio.charset.StandardCharsets;
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

	public TranscriptCtl(Composite parent, PublishSubject<SaidVtt> changed, Runnable save) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped);
		SashForm horizontalForm = new SashForm(wrapped, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		saidCtl = new SaidCtl(horizontalForm, changed);

		SashForm verticalForm = new SashForm(horizontalForm, SWT.VERTICAL);
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm, youtubeCtl, changed);

		mismatchCtl = new MismatchCtl(wrapped, saidCtl, vttCtl, save);
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
			SwtMisc.blockForError("Save failed!", "Size before = " + sizeBefore + "\nSize after = " + sizeAfter + "\nReverting and quitting.");
			Files.write(before.getBytes(StandardCharsets.UTF_8), folder.fileVtt(transcript));
			mismatchCtl.getShell().dispose();
		} else {
			mismatchCtl.setMatch(match);
		}
	}
}
