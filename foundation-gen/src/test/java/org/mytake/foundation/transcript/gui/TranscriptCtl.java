/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtMisc;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Shell;

public class TranscriptCtl extends ControlWrapper.AroundControl<Composite> {
	private final SaidCtl saidCtl;
	private final VttCtl vttCtl;
	private final YoutubeCtl youtubeCtl;
	private final MismatchCtl mismatchCtl;

	public TranscriptCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped);
		SashForm horizontalForm = new SashForm(wrapped, SWT.HORIZONTAL);
		Layouts.setGridData(horizontalForm).grabAll();
		saidCtl = new SaidCtl(horizontalForm);

		SashForm verticalForm = new SashForm(horizontalForm, SWT.VERTICAL);
		youtubeCtl = new YoutubeCtl(verticalForm);
		vttCtl = new VttCtl(verticalForm, youtubeCtl);

		mismatchCtl = new MismatchCtl(wrapped, saidCtl, vttCtl);
		Layouts.setGridData(mismatchCtl).grabHorizontal();
	}

	public void setTo(Object recording) {
		//		SaidTranscript said = Errors.rethrow().get(() -> SaidTranscript.parse(null, recording.getSaidFile()));
		//		VttTranscript vtt = Errors.rethrow().get(() -> VttTranscript.parse(recording.getVttFile()));
		//		WordMatch wordMatch = new WordMatch(said, vtt);
		//
		//		youtubeCtl.setToYoutubeId(recording.youtubeId());
		//		saidCtl.setFile(recording.getSaidFile(), said);
		//		vttCtl.setFile(recording.getVttFile(), wordMatch);
		//		mismatchCtl.setMatch(wordMatch);
	}

	public static void main(String[] args) {
		Shell shell = Shells.builder(SWT.SHELL_TRIM, cmp -> {
			TranscriptCtl coat = new TranscriptCtl(cmp);
			coat.setTo(null);
		})
				.setSize(SwtMisc.scaleByFontHeight(40, 30))
				.openOnDisplay();
		SwtMisc.loopUntilDisposed(shell);
	}
}
