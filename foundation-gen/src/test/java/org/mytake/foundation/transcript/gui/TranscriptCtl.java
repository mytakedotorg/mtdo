/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import io.reactivex.subjects.PublishSubject;
import java.io.IOException;
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

	public TranscriptCtl(Composite parent, PublishSubject<SaidVtt> changed) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped);
		SashForm horizontalForm = new SashForm(wrapped, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		saidCtl = new SaidCtl(horizontalForm, changed);

		SashForm verticalForm = new SashForm(horizontalForm, SWT.VERTICAL);
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm, youtubeCtl, changed);

		mismatchCtl = new MismatchCtl(wrapped, saidCtl, vttCtl);
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
		match = match.save(folder, transcript, vttCtl.getWords(), saidCtl.getText());
		mismatchCtl.setMatch(match);
	}
}
