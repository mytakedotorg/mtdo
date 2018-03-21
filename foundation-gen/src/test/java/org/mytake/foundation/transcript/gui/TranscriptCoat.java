/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.swt.Layouts;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.mytake.foundation.transcript.Recording;
import org.mytake.foundation.transcript.SaidTranscript;
import org.mytake.foundation.transcript.VttTranscript;
import org.mytake.foundation.transcript.WordMatch;

public class TranscriptCoat {
	private final SaidCtl saidCtl;
	private final VttCtl vttCtl;
	private final YoutubeCtl youtubeCtl;
	private final MismatchCtl mismatchCtl;

	public TranscriptCoat(Composite parent) {
		Layouts.setGrid(parent);
		SashForm horizontalForm = new SashForm(parent, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		saidCtl = new SaidCtl(horizontalForm);

		SashForm verticalForm = new SashForm(horizontalForm, SWT.VERTICAL);
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm);

		mismatchCtl = new MismatchCtl(parent, saidCtl, vttCtl);
		Layouts.setGridData(mismatchCtl).grabHorizontal();
	}

	public void setTo(Recording recording) {
		SaidTranscript said = Errors.rethrow().get(() -> SaidTranscript.parse(recording.getSaidFile()));
		VttTranscript vtt = Errors.rethrow().get(() -> VttTranscript.parse(recording.getVttFile()));
		WordMatch wordMatch = new WordMatch(said, vtt);

		youtubeCtl.setToYoutubeId(recording.youtubeId());
		saidCtl.setFile(recording.getSaidFile(), said);
		vttCtl.setFile(recording.getVttFile(), wordMatch);
		mismatchCtl.setMatch(wordMatch);
	}
}
