/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Either;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.eclipse.jgit.diff.Edit;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.Word;
import org.mytake.foundation.transcript.WordMatch;

public class MismatchCtl extends ControlWrapper.AroundControl<Composite> {
	private final SaidCtl said;
	private final VttCtl vtt;

	private final Button leftBtn, rightBtn;
	private final Text groupTxt;
	private final Label ofGroupLbl;
	private final Text saidTxt, vttTxt;
	private final Button saidTakeBtn, vttTakeBtn;

	public MismatchCtl(Composite parent, SaidCtl said, VttCtl vtt) {
		super(new Composite(parent, SWT.NONE));
		this.said = said;
		this.vtt = vtt;
		Layouts.setGrid(wrapped).margin(0).numColumns(3);

		Composite leftCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGrid(leftCmp).margin(0).numColumns(3);

		leftBtn = new Button(leftCmp, SWT.ARROW | SWT.LEFT);
		groupTxt = new Text(leftCmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(groupTxt).widthHint(5 * SwtMisc.systemFontWidth());
		rightBtn = new Button(leftCmp, SWT.ARROW | SWT.RIGHT);

		leftBtn.addListener(SWT.Selection, e -> incrementGroupUp(false));
		rightBtn.addListener(SWT.Selection, e -> incrementGroupUp(true));
		groupTxt.addListener(SWT.DefaultSelection, e -> setGroup());

		ofGroupLbl = new Label(leftCmp, SWT.CENTER);
		Layouts.setGridData(ofGroupLbl).horizontalSpan(3).grabHorizontal();

		Button highlightBtn = new Button(wrapped, SWT.PUSH | SWT.FLAT);
		highlightBtn.setText("Highlight");
		Layouts.setGridData(highlightBtn).grabVertical();
		highlightBtn.addListener(SWT.Selection, e -> setGroup());

		Composite rightCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(rightCmp).grabAll();
		Layouts.setGrid(rightCmp).numColumns(3).margin(0);

		Labels.create(rightCmp, "Said");
		saidTakeBtn = new Button(rightCmp, SWT.PUSH | SWT.FLAT);
		saidTakeBtn.setText("\u2714");
		saidTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(saidTxt).grabHorizontal();

		Labels.create(rightCmp, "VTT");
		vttTakeBtn = new Button(rightCmp, SWT.PUSH | SWT.FLAT);
		vttTakeBtn.setText("\u2714");
		vttTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(vttTxt).grabHorizontal();

		saidTakeBtn.addListener(SWT.Selection, e -> {
			SwtMisc.blockForError("TODO", "TODO");
		});
		vttTakeBtn.addListener(SWT.Selection, e -> {
			SwtMisc.blockForError("TODO", "TODO");
		});
	}

	private void incrementGroupUp(boolean isUp) {
		int idx = Integer.parseInt(groupTxt.getText());
		setGroup(isUp ? ++idx : --idx);
	}

	private WordMatch wordMatch;

	public void setMatch(WordMatch wordMatch) {
		this.wordMatch = wordMatch;
		groupTxt.setText(Integer.toString(wordMatch.edits().size()));
		ofGroupLbl.setText("of " + wordMatch.edits().size());
		setGroup(wordMatch.edits().size());
	}

	private void setGroup() {
		setGroup(Integer.parseInt(groupTxt.getText()));
	}

	private void setGroup(int idx) {
		groupTxt.setText(Integer.toString(idx));
		leftBtn.setEnabled(idx != 1);
		rightBtn.setEnabled(idx != wordMatch.edits().size());

		Edit edit = wordMatch.edits().get(idx - 1);
		Either<List<Word.Said>, Integer> said = wordMatch.saidFor(edit);
		Either<List<Word.Vtt>, Integer> vtt = wordMatch.vttFor(edit);
		saidTxt.setText(toString(said));
		vttTxt.setText(toString(vtt));
		setSaid(said);
		setVtt(vtt);
	}

	private static String toString(Either<?, Integer> either) {
		if (either.isLeft()) {
			@SuppressWarnings("unchecked")
			List<Word> words = (List<Word>) either.getLeft();
			return words.stream().map(Word::lowercase).collect(Collectors.joining(" "));
		} else {
			return "";
		}
	}

	private void setSaid(Either<List<Word.Said>, Integer> either) {
		if (either.isLeft()) {
			Word.Said firstWord = either.getLeft().get(0);
			Word.Said lastWord = either.getLeft().get(either.getLeft().size() - 1);
			said.select(firstWord.startIdx(), lastWord.endIdx());
		} else {
			Word.Said word = wordMatch.saidWords().get(either.getRight());
			said.select(Math.max(0, word.startIdx() - 1), word.startIdx());
		}
	}

	private void setVtt(Either<List<Word.Vtt>, Integer> either) {
		List<Word.Vtt> list = either.fold(Function.identity(), idx -> {
			if (idx == 0) {
				return wordMatch.vttWords().subList(0, 1);
			} else {
				return wordMatch.vttWords().subList(idx - 1, idx + 1);
			}
		});
		int firstIdx = wordMatch.vttWords().indexOf(list.get(0));
		vtt.highlight(firstIdx + list.size() / 2, list);
	}
}
