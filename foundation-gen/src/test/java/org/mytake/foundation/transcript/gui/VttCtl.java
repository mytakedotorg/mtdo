/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.Unhandled;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.jface.ColumnViewerFormat;
import io.reactivex.subjects.PublishSubject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.eclipse.jface.viewers.ArrayContentProvider;
import org.eclipse.jface.viewers.IStructuredSelection;
import org.eclipse.jface.viewers.StructuredSelection;
import org.eclipse.jface.viewers.TableViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.graphics.Rectangle;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.TableItem;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.TranscriptMatch;
import org.mytake.foundation.transcript.Word;

public class VttCtl extends ControlWrapper.AroundControl<Composite> {
	private PublishSubject<Boolean> changed;

	private final TableViewer viewer;

	private static String formatTime(double time) {
		return String.format("%.3f", time);
	}

	private enum Col {
		TIME, WORD;

		// @formatter:off
		<T> T timeWord(T time, T word) {
			switch (this) {
			case TIME: return time;
			case WORD: return word;
			default: throw Unhandled.enumException(this);
			}
		}
		// @formatter:on
	}

	@SuppressWarnings("unchecked")
	public VttCtl(Composite parent, YoutubeCtl youtube, PublishSubject<Boolean> changed) {
		super(new Composite(parent, SWT.NONE));
		this.changed = changed;
		Layouts.setGrid(wrapped).margin(0).spacing(0);

		Composite tableCmp = new Composite(wrapped, SWT.BORDER);
		Layouts.setGridData(tableCmp).grabAll();

		Composite bottomCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(bottomCmp).grabHorizontal();

		ColumnViewerFormat<Word.Vtt> time = ColumnViewerFormat.builder();
		time.addColumn().setText("Time").setLabelProviderText(word -> formatTime(word.time())).setLayoutPixel(9 * SwtMisc.systemFontWidth());
		time.addColumn().setText("Word").setLabelProviderText(word -> word.lowercase()).setLayoutWeight(1);
		time.setHeaderVisible(true);
		time.setLinesVisible(true);
		time.setUseHashLookup(true);
		time.setStyle(SWT.MULTI | SWT.FULL_SELECTION);
		viewer = time.buildTable(tableCmp);
		viewer.setContentProvider(ArrayContentProvider.getInstance());
		// play on select
		viewer.addSelectionChangedListener(e -> {
			int[] selection = viewer.getTable().getSelectionIndices();
			if (selection == null || selection.length == 0) {
				return;
			}
			Arrays.sort(selection);
			int minIdx = selection[0];
			int maxIdx = Math.min(selection[selection.length - 1] + 1, words.size() - 1);
			youtube.play(words.get(minIdx).time(), words.get(maxIdx).time());
		});
		// remove on delete key
		viewer.getTable().addListener(SWT.KeyDown, e -> {
			if (isDelete(e)) {
				delete(((IStructuredSelection) viewer.getSelection()).toList());
			}
		});
		// edit on double-click
		viewer.getTable().addListener(SWT.MouseDoubleClick, e -> {
			Word.Vtt word = (Word.Vtt) ((IStructuredSelection) viewer.getSelection()).getFirstElement();
			if (word == null) {
				return;
			}
			Point pt = new Point(e.x, e.y);
			TableItem item = viewer.getTable().getItem(pt);
			for (int i = 0; i < Col.values().length; ++i) {
				Rectangle rect = item.getBounds(i);
				if (rect.contains(pt)) {
					Col col = Col.values()[i];
					Shells.builder(SWT.APPLICATION_MODAL | SWT.DIALOG_TRIM, cmp -> {
						editWord(cmp, word, col);
					}).setTitle("Edit word")
							.openOnActive();
					return;
				}
			}
		});

		// add on button
		Layouts.setGrid(bottomCmp).margin(0).numColumns(2);
		Button addBtn = new Button(bottomCmp, SWT.PUSH | SWT.FLAT);
		addBtn.setText("Add below selection");
		Text addTxt = new Text(bottomCmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(addTxt).grabHorizontal();

		Runnable add = Errors.dialog().wrap(() -> {
			int selection = viewer.getTable().getSelectionIndex();
			Preconditions.checkArgument(selection != -1, "Must select something");
			String word = addTxt.getText().trim();
			Preconditions.checkArgument(!word.isEmpty(), "Cannot be empty");
			List<Word.Said> saidWords = Arrays.stream(word.split(" ")).map(Word.Said::dummy).collect(Collectors.toList());
			List<Word.Vtt> newWords = insert(selection + 1, saidWords);
			addTxt.setText("");
			viewer.setSelection(new StructuredSelection(newWords));
		});
		addBtn.addListener(SWT.Selection, e -> add.run());
		addTxt.addListener(SWT.DefaultSelection, e -> add.run());
	}

	private void editWord(Composite cmp, Word.Vtt word, Col activeCol) {
		Layouts.setGrid(cmp).numColumns(2);
		Labels.create(cmp, "Word");
		Text wordTxt = new Text(cmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(wordTxt).grabHorizontal();
		wordTxt.setText(word.lowercase());

		Labels.create(cmp, "Time");
		Text timeTxt = new Text(cmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(timeTxt).grabHorizontal();
		timeTxt.setText(formatTime(word.time()));

		Runnable ok = Errors.dialog().wrap(() -> {
			String txt = wordTxt.getText();
			Preconditions.checkArgument(!txt.contains(" "), "Cannot contain space");
			double time = Double.parseDouble(timeTxt.getText());
			replace(word, new Word.Vtt(txt, time));
			cmp.getShell().dispose();
		});
		wordTxt.addListener(SWT.DefaultSelection, e -> ok.run());
		timeTxt.addListener(SWT.DefaultSelection, e -> ok.run());

		Composite btnCmp = new Composite(cmp, SWT.NONE);
		Layouts.setGridData(btnCmp).horizontalSpan(2).grabHorizontal();
		Layouts.setGrid(btnCmp).margin(0).numColumns(3);
		Layouts.newGridPlaceholder(btnCmp).grabHorizontal();
		Button okBtn = new Button(btnCmp, SWT.PUSH);
		okBtn.setText("OK");
		Layouts.setGridData(okBtn).widthHint(SwtMisc.defaultButtonWidth());
		okBtn.addListener(SWT.Selection, e -> ok.run());

		Button cancelBtn = new Button(btnCmp, SWT.PUSH);
		cancelBtn.setText("Cancel");
		Layouts.setGridData(cancelBtn).widthHint(SwtMisc.defaultButtonWidth());
		cancelBtn.addListener(SWT.Selection, e -> {
			cmp.getShell().dispose();
		});

		Text active = activeCol.timeWord(timeTxt, wordTxt);
		active.selectAll();
		active.setFocus();
	}

	private static boolean isDelete(Event e) {
		return e.keyCode == SWT.DEL || e.keyCode == SWT.BS;
	}

	private List<Word.Vtt> words;

	public void setFile(TranscriptMatch match) {
		this.words = new ArrayList<>(match.vttWords());
		viewer.setInput(words);
	}

	public void highlight(int middleIdx, List<Word.Vtt> list) {
		int numRows = viewer.getTable().getSize().y / viewer.getTable().getItemHeight();
		viewer.getTable().setTopIndex(Math.max(0, middleIdx - (numRows / 2) - 1));
		viewer.getTable().setSelection(middleIdx);

		boolean reveal = true;
		viewer.setSelection(new StructuredSelection(list), reveal);
	}

	public void delete(List<Word.Vtt> vttWords) {
		changed.onNext(true);
		words.removeAll(vttWords);
		viewer.remove(vttWords.toArray());
	}

	public void replace(Word.Vtt vttOld, Word.Vtt vttNew) {
		changed.onNext(true);
		int idx = words.indexOf(vttOld);
		words.set(idx, vttNew);
		viewer.replace(vttNew, idx);
	}

	public List<Word.Vtt> insert(int insertionPoint, List<Word.Said> said) {
		changed.onNext(true);
		double before = insertionPoint == 0 ? 0 : words.get(insertionPoint - 1).time();
		double after = words.get(insertionPoint).time();

		List<Word.Vtt> newWords = new ArrayList<>();
		for (int i = 0; i < said.size(); ++i) {
			double dt = (after - before) / (said.size() + 1);
			Word.Vtt newWord = new Word.Vtt(said.get(i).lowercase(), before + dt * (i + 1));
			newWords.add(newWord);
			words.add(insertionPoint, newWord);
			viewer.insert(newWord, insertionPoint);
			++insertionPoint;
		}
		return newWords;
	}

	public List<Word.Vtt> getWords() {
		return words;
	}
}
