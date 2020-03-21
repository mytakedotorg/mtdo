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

	public SaidCtl(Composite parent, PublishSubject<Boolean> changed) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0).spacing(0);

		Labels.createBold(wrapped, "Said");
		styled = new Text(wrapped, SWT.MULTI | SWT.BORDER | SWT.V_SCROLL | SWT.WRAP);
		Layouts.setGridData(styled).grabAll();
		styled.addListener(SWT.Modify, e -> {
			changed.onNext(true);
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
			String before = txt.substring(0, sel.x);
			String after = txt.substring(sel.y);
			if (after.startsWith(" ") && (before.endsWith(" ") || before.isEmpty())) {
				return before + after.substring(1);
			} else if (after.isEmpty() && before.endsWith(" ")) {
				return before.substring(0, before.length() - 1);
			} else {
				return before + after;
			}
		});
	}

	public void insert(int insertAt, List<Vtt> vttWords) {
		modify(txt -> {
			String before = txt.substring(0, insertAt);
			String after = txt.substring(insertAt);
			if (!before.isEmpty() && !before.endsWith(" ")) {
				before = before + " ";
			}
			if (!after.isEmpty() && !after.startsWith(" ")) {
				after = " " + after;
			}
			return before
					+ vttWords.stream().map(Word::lowercase).collect(Collectors.joining(" "))
					+ after;
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
