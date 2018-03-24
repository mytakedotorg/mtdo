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
import com.diffplug.common.util.concurrent.Runnables;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.eclipse.jgit.diff.Edit;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.TranscriptMatch;
import org.mytake.foundation.transcript.Word;

public class MismatchCtl extends ControlWrapper.AroundControl<Composite> {
	private final SaidCtl saidCtl;
	private final VttCtl vttCtl;

	private final Button leftBtn, rightBtn;
	private final Text groupTxt;
	private final Label ofGroupLbl;
	private final Text saidTxt, vttTxt;
	private final Button takeSaidBtn, takeVttBtn;

	public MismatchCtl(Composite parent, SaidCtl saidCtl, VttCtl vttCtl) {
		super(new Composite(parent, SWT.NONE));
		this.saidCtl = saidCtl;
		this.vttCtl = vttCtl;
		Layouts.setGrid(wrapped).margin(0).numColumns(4);

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
		takeSaidBtn = new Button(rightCmp, SWT.PUSH | SWT.FLAT);
		takeSaidBtn.setText("\u2714");
		saidTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(saidTxt).grabHorizontal();

		Labels.create(rightCmp, "VTT");
		takeVttBtn = new Button(rightCmp, SWT.PUSH | SWT.FLAT);
		takeVttBtn.setText("\u2714");
		vttTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(vttTxt).grabHorizontal();

		takeSaidBtn.addListener(SWT.Selection, e -> {
			takeSaid.run();
			incrementGroupUp(false);
		});
		takeVttBtn.addListener(SWT.Selection, e -> {
			takeVtt.run();
			incrementGroupUp(false);
		});
		Button deleteBtn = new Button(wrapped, SWT.PUSH);
		deleteBtn.setText("X");
		deleteBtn.addListener(SWT.Selection, e -> {
			if (!deleteEnabled) {
				if (!SwtMisc.blockForQuestion("Enable deleting",
						"This will delete both sections of the transcript.  This is only useful " +
								"for quick and dirty stuff. Are you sure you want to do this?")) {
					return;
				} else {
					deleteEnabled = true;
				}
			}
			delete.run();
			incrementGroupUp(false);
		});
	}

	private Runnable takeSaid, takeVtt;
	private Runnable delete;

	boolean deleteEnabled = false;

	private void incrementGroupUp(boolean isUp) {
		int idx = Integer.parseInt(groupTxt.getText());
		setGroup(isUp ? ++idx : --idx);
	}

	private TranscriptMatch match;

	public void setMatch(TranscriptMatch wordMatch) {
		this.match = wordMatch;
		groupTxt.setText(Integer.toString(wordMatch.edits().size()));
		ofGroupLbl.setText("of " + wordMatch.edits().size());
		if (!wordMatch.edits().isEmpty()) {
			setGroup(wordMatch.edits().size());
		}
	}

	private void setGroup() {
		setGroup(Integer.parseInt(groupTxt.getText()));
	}

	private void setGroup(int idx) {
		groupTxt.setText(Integer.toString(idx));
		leftBtn.setEnabled(idx != 1);
		rightBtn.setEnabled(idx != match.edits().size());

		Edit edit = match.edits().get(idx - 1);
		Either<List<Word.Said>, Integer> said = match.saidFor(edit);
		Either<List<Word.Vtt>, Integer> vtt = match.vttFor(edit);
		saidTxt.setText(toString(said));
		vttTxt.setText(toString(vtt));
		Point saidSel = setSaid(said);
		setVtt(vtt);

		takeSaid = Runnables.doNothing();
		takeVtt = Runnables.doNothing();

		if (said.isLeft()) {
			List<Word.Said> saidWords = said.getLeft();
			if (vtt.isLeft()) {
				// both modified
				List<Word.Vtt> vttWords = vtt.getLeft();
				if (saidWords.size() == 1 && vttWords.size() == 1) {
					takeSaid = () -> vttCtl.replace(vttWords.get(0), saidWords.get(0));
					takeVtt = () -> saidCtl.replace(saidSel, vttWords.get(0));
				} else {
					//takeSaid = replaceVttFromSaid
					//takeVtt = replaceSaidFromVtt
				}
			} else {
				// added to said
				int vttInsertionPoint = vtt.getRight();
				if (saidWords.size() == 1) {
					takeSaid = () -> vttCtl.insert(vttInsertionPoint, saidWords.get(0));
					// takeSaid = insertIntoVtt
				}
				takeVtt = () -> saidCtl.remove(new Point(saidSel.x, saidSel.y + 1)); //deleteFromSaid (+1 for space)
			}
		} else {
			if (vtt.isLeft()) {
				// added to vtt
				List<Word.Vtt> vttWords = vtt.getLeft();
				takeSaid = () -> vttCtl.delete(vttWords); //deleteFromVtt
				takeVtt = () -> saidCtl.insert(saidSel.y, vttWords); //insertIntoSaid
			} else {
				throw new IllegalStateException();
			}
		}

		takeSaidBtn.setEnabled(takeSaid != Runnables.doNothing());
		takeVttBtn.setEnabled(takeVtt != Runnables.doNothing());

		delete = () -> {
			if (said.isLeft()) {
				saidCtl.remove(new Point(saidSel.x, saidSel.y + 1));
			}
			if (vtt.isLeft()) {
				vttCtl.delete(vtt.getLeft());
			}
		};
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

	private Point setSaid(Either<List<Word.Said>, Integer> either) {
		Point point;
		if (either.isLeft()) {
			Word.Said firstWord = either.getLeft().get(0);
			Word.Said lastWord = either.getLeft().get(either.getLeft().size() - 1);
			point = new Point(firstWord.startIdx(), lastWord.endIdx());
		} else {
			// select the whitespace where it would insert
			Word.Said word = match.saidWords().get(either.getRight());
			point = new Point(Math.max(0, word.startIdx() - 1), word.startIdx());
		}
		saidCtl.select(point);
		return point;
	}

	private void setVtt(Either<List<Word.Vtt>, Integer> either) {
		List<Word.Vtt> list = either.fold(Function.identity(), idx -> {
			if (idx == 0) {
				return match.vttWords().subList(0, 1);
			} else if (idx >= match.vttWords().size() - 1) {
				return match.vttWords().subList(match.vttWords().size() - 1, match.vttWords().size());
			} else {
				return match.vttWords().subList(idx - 1, idx + 1);
			}
		});
		int firstIdx = match.vttWords().indexOf(list.get(0));
		vttCtl.highlight(firstIdx + list.size() / 2, list);
	}
}
