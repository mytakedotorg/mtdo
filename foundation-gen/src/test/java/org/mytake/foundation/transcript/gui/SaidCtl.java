/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import io.reactivex.subjects.PublishSubject;
import java.util.List;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import org.eclipse.jface.text.BadLocationException;
import org.eclipse.jface.text.Document;
import org.eclipse.jface.text.TextViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Composite;
import org.mytake.foundation.transcript.SaidTranscript;
import org.mytake.foundation.transcript.Word;
import org.mytake.foundation.transcript.Word.Vtt;

public class SaidCtl extends ControlWrapper.AroundControl<Composite> {
	private final TextViewer styled;

	public SaidCtl(Composite parent, PublishSubject<Boolean> changed) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0).spacing(0);

		Labels.createBold(wrapped, "Newspaper");
		styled = new TextViewer(wrapped, SWT.MULTI | SWT.BORDER | SWT.V_SCROLL | SWT.WRAP);
		Layouts.setGridData(styled.getControl()).grabAll();
		styled.setDocument(new SaidDocument());
	}

	public void setFile(SaidTranscript said) {
		StringBuilder builder = new StringBuilder();
		for (SaidTranscript.Turn turn : said.turns()) {
			builder.append(turn.speaker());
			builder.append(": ");
			builder.append(turn.said());
			builder.append("\n\n");
		}
		styled.getDocument().set(builder.toString());
	}

	public String getText() {
		String txt = styled.getDocument().get();
		if (txt.endsWith("\n\n")) {
			return txt.substring(0, txt.length() - 1);
		} else {
			return txt;
		}
	}

	public void select(Point selection) {
		styled.setSelectedRange(selection.x, selection.y - selection.x);
		styled.revealRange(selection.x, selection.y - selection.x);
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
		String before = styled.getDocument().get();
		String after = edit.apply(before);
		styled.getControl().setVisible(false);
		styled.getDocument().set(after);
		styled.setTopIndex(topIndex);
		styled.getControl().setVisible(true);
	}

	/** A document which does not allow windows newlines. */
	static class SaidDocument extends Document {
		private static String purgeCR(String text) {
			if (text.indexOf('\r') == -1) {
				return text;
			} else {
				return text.replace("\r\n", "\n").replace("\r", "\n");
			}
		}

		@Override
		public void replace(int pos, int length, String text) throws BadLocationException {
			super.replace(pos, length, purgeCR(text));
		}

		@Override
		public void set(String text, long modificationStamp) {
			super.set(purgeCR(text), modificationStamp);
		}
	}
}
