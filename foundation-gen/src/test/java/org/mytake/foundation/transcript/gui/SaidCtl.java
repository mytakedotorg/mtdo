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
import java.util.List;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.SaidTranscript;
import org.mytake.foundation.transcript.Word;
import org.mytake.foundation.transcript.Word.Vtt;

public class SaidCtl extends ControlWrapper.AroundControl<Composite> {
	private final Text styled;

	public SaidCtl(Composite parent, PublishSubject<SaidVtt> changed) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		styled = new Text(wrapped, SWT.MULTI | SWT.BORDER | SWT.V_SCROLL | SWT.WRAP);
		Layouts.setGridData(styled).grabAll();
		styled.addListener(SWT.Modify, e -> {
			changed.onNext(SaidVtt.SAID);
		});
	}

	public void setFile(SaidTranscript said) {
		StringBuilder builder = new StringBuilder();
		for (SaidTranscript.Turn turn : said.turns()) {
			builder.append(turn.speaker());
			builder.append(": ");
			builder.append(turn.said());
			builder.append("\n\n");
		}
		styled.setText(builder.toString());
	}

	public String getText() {
		String txt = styled.getText();
		if (txt.endsWith("\n\n")) {
			return txt.substring(0, txt.length() - 1);
		} else {
			return txt;
		}
	}

	public void select(Point selection) {
		styled.setSelection(selection);
	}

	public void remove(Point sel) {
		modify(txt -> {
			return txt.substring(0, sel.x) + txt.substring(sel.y);
		});
	}

	public void insert(int insertAt, List<Vtt> vttWords) {
		modify(txt -> {
			return txt.substring(0, insertAt)
					+ vttWords.stream().map(Word::lowercase).collect(Collectors.joining(" "))
					+ txt.substring(insertAt);
		});
	}

	public void replace(Point sel, Word.Vtt vtt) {
		modify(txt -> {
			return txt.substring(0, sel.x) + vtt.lowercase() + txt.substring(sel.y);
		});
	}

	private void modify(UnaryOperator<String> edit) {
		int topIndex = styled.getTopIndex();
		String before = styled.getText();
		String after = edit.apply(before);
		styled.setVisible(false);
		styled.setText(after);
		styled.setTopIndex(topIndex);
		styled.setVisible(true);
	}
}
