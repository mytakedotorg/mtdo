/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.Layouts;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.mytake.foundation.transcript.Recording;

public class TranscriptCoat {
	private final SpeakersCtl speakersCtl;
	private final VttCtl vttCtl;
	private final YoutubeCtl youtubeCtl;
	private final MismatchCtl mismatchCtl;

	public TranscriptCoat(Composite parent) {
		Layouts.setGrid(parent);
		SashForm horizontalForm = new SashForm(parent, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		mismatchCtl = new MismatchCtl(parent);
		Layouts.setGridData(mismatchCtl).grabHorizontal();
		speakersCtl = new SpeakersCtl(horizontalForm);

		SashForm verticalForm = new SashForm(horizontalForm, SWT.VERTICAL);
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm);
	}

	public void setTo(Recording recording) {
		youtubeCtl.setToYoutubeId(recording.youtubeId());
		speakersCtl.setFile(recording.getSpeakersFile());
		vttCtl.setFile(recording.getVttFile());
	}
}
