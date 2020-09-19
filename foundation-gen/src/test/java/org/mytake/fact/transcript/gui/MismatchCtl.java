/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.fact.transcript.gui;


import com.diffplug.common.base.Either;
import com.diffplug.common.rx.Rx;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.util.concurrent.Runnables;
import io.reactivex.subjects.PublishSubject;
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
import org.mytake.fact.transcript.TranscriptMatch;
import org.mytake.fact.transcript.Word;

public class MismatchCtl extends ControlWrapper.AroundControl<Composite> {
	private final SaidCtl saidCtl;
	private final VttCtl vttCtl;
	private final YoutubeCtl youtubeCtl;

	private final Button leftBtn, rightBtn;
	private final Text groupTxt;
	private final Text plusMinusTxt;
	private final Label ofGroupLbl;
	private final Text saidTxt, vttTxt;
	private final Button takeSaidBtn, takeVttBtn;

	public MismatchCtl(Composite parent, SaidCtl saidCtl, VttCtl vttCtl, YoutubeCtl youtubeCtl, PublishSubject<Boolean> saveEnabled, Runnable save) {
		super(new Composite(parent, SWT.NONE));
		this.saidCtl = saidCtl;
		this.vttCtl = vttCtl;
		this.youtubeCtl = youtubeCtl;
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

		Composite playAgainCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGrid(playAgainCmp).numColumns(3).margin(0);

		Button highlightBtn = new Button(playAgainCmp, SWT.PUSH | SWT.FLAT);
		Layouts.setGridData(highlightBtn).horizontalSpan(3).horizontalAlignment(SWT.FILL);
		highlightBtn.setText("Play again");
		highlightBtn.addListener(SWT.Selection, e -> setGroup());

		Labels.create(playAgainCmp, "+/-");
		plusMinusTxt = new Text(playAgainCmp, SWT.SINGLE | SWT.BORDER);
		plusMinusTxt.setText("1.0");
		Labels.create(playAgainCmp, "secs");

		Composite rightCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(rightCmp).grabAll();
		Layouts.setGrid(rightCmp).numColumns(3).margin(0);

		Labels.create(rightCmp, "Newspaper");
		takeSaidBtn = new Button(rightCmp, SWT.PUSH | SWT.FLAT);
		takeSaidBtn.setText("\u2714");
		saidTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(saidTxt).grabHorizontal();

		Labels.create(rightCmp, "YouTube");
		takeVttBtn = new Button(rightCmp, SWT.PUSH | SWT.FLAT);
		takeVttBtn.setText("\u2714");
		vttTxt = new Text(rightCmp, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(vttTxt).grabHorizontal();

		takeSaidBtn.addListener(SWT.Selection, e -> {
			takeSaid.run();
			save.run();
		});
		takeVttBtn.addListener(SWT.Selection, e -> {
			takeVtt.run();
			save.run();
		});
		Rx.subscribe(saveEnabled, enabled -> {
			takeSaidBtn.setEnabled(!enabled);
			takeVttBtn.setEnabled(!enabled);
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
			save.run();
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
			setGroup(1);
		}
	}

	private void setGroup() {
		setGroup(Integer.parseInt(groupTxt.getText()));
	}

	private void setGroup(int idxOneBased) {
		youtubeCtl.setPlayAllowed(false);
		if (idxOneBased < 1) {
			idxOneBased = 1;
		} else if (idxOneBased > match.edits().size()) {
			idxOneBased = match.edits().size();
		}
		groupTxt.setText(Integer.toString(idxOneBased));
		leftBtn.setEnabled(idxOneBased != 1);
		rightBtn.setEnabled(idxOneBased != match.edits().size());

		Edit edit = match.edits().get(idxOneBased - 1);
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
				boolean sameSpeaker = !saidCtl.getText().substring(saidSel.x, saidSel.y).contains("\n");
				if (sameSpeaker) {
					takeSaid = () -> {
						int insertionPoint = vttCtl.getWords().indexOf(vttWords.get(0));
						vttCtl.delete(vttWords);
						vttCtl.insert(insertionPoint, saidWords);
					};
					takeVtt = () -> {
						saidCtl.remove(saidSel);
						saidCtl.insert(saidSel.x, vttWords);
					};
				}
			} else {
				// added to said
				int vttInsertionPoint = vtt.getRight();
				takeSaid = () -> vttCtl.insert(vttInsertionPoint, saidWords);
				takeVtt = () -> saidCtl.remove(saidSel);
			}
		} else {
			if (vtt.isLeft()) {
				// added to vtt
				List<Word.Vtt> vttWords = vtt.getLeft();
				takeSaid = () -> vttCtl.delete(vttWords); //deleteFromVtt
				takeVtt = () -> saidCtl.insert(saidSel.x, vttWords); //insertIntoSaid
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

		youtubeCtl.setPlayAllowed(true);
		double plusMinus = Double.parseDouble(plusMinusTxt.getText());
		double start = Math.max(0, youtubeCtl.lastStart() - plusMinus);
		double end = youtubeCtl.lastEnd() + plusMinus;
		youtubeCtl.play(start, end);
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
