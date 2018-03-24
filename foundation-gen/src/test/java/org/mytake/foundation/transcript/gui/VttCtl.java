/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.base.Preconditions;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.jface.ColumnViewerFormat;
import io.reactivex.subjects.PublishSubject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.eclipse.jface.viewers.ArrayContentProvider;
import org.eclipse.jface.viewers.IStructuredSelection;
import org.eclipse.jface.viewers.StructuredSelection;
import org.eclipse.jface.viewers.TableViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.TranscriptMatch;
import org.mytake.foundation.transcript.Word;

public class VttCtl extends ControlWrapper.AroundControl<Composite> {
	private PublishSubject<SaidVtt> changed;

	private final Button addBtn;
	private final Text addTxt;
	private final TableViewer viewer;

	private static String formatTime(double time) {
		return String.format("%.3f", time);
	}

	@SuppressWarnings("unchecked")
	public VttCtl(Composite parent, YoutubeCtl youtube, PublishSubject<SaidVtt> changed) {
		super(new Composite(parent, SWT.NONE));
		this.changed = changed;
		Layouts.setGrid(wrapped).margin(0);

		Composite tableCmp = new Composite(wrapped, SWT.BORDER);
		Layouts.setGridData(tableCmp).grabAll();

		Composite bottomCmp = new Composite(wrapped, SWT.NONE);
		Layouts.setGridData(bottomCmp).grabHorizontal();
		Layouts.setGrid(bottomCmp).margin(0).numColumns(2);
		addBtn = new Button(bottomCmp, SWT.PUSH | SWT.FLAT);
		addBtn.setText("Add below selection");
		addTxt = new Text(bottomCmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(addTxt).grabHorizontal();

		ColumnViewerFormat<Word.Vtt> time = ColumnViewerFormat.builder();
		time.addColumn().setText("Time").setLabelProviderText(word -> formatTime(word.time())).setLayoutPixel(6 * SwtMisc.systemFontWidth());
		time.addColumn().setText("Word").setLabelProviderText(word -> word.lowercase()).setLayoutWeight(1);
		time.setHeaderVisible(true);
		time.setLinesVisible(true);
		time.setUseHashLookup(true);
		time.setStyle(SWT.MULTI);
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
			if (word != null) {
				Shells.builder(SWT.APPLICATION_MODAL | SWT.DIALOG_TRIM, cmp -> {
					editWord(cmp, word);
				}).setTitle("Edit word")
						.openOnActive();
			}
		});
		// add on button
		addBtn.addListener(SWT.Selection, e -> {
			int selection = viewer.getTable().getSelectionIndex();
			if (selection == -1) {
				SwtMisc.blockForError("Must select something", "Must select something");
				return;
			}
			String word = addTxt.getText().trim();
			if (word.indexOf(' ') != -1) {
				SwtMisc.blockForError("Cannot contain whitespace", "Cannot contain whitespace");
				return;
			}
			insert(selection + 1, Word.Said.dummy(word));
			addTxt.setText("");
		});
	}

	private void editWord(Composite cmp, Word.Vtt word) {
		Layouts.setGrid(cmp).numColumns(2);
		Labels.create(cmp, "Word");
		Text wordTxt = new Text(cmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(wordTxt).grabHorizontal();
		wordTxt.setText(word.lowercase());

		Labels.create(cmp, "Time");
		Text timeTxt = new Text(cmp, SWT.SINGLE | SWT.BORDER);
		Layouts.setGridData(timeTxt).grabHorizontal();
		timeTxt.setText(formatTime(word.time()));

		Composite btnCmp = new Composite(cmp, SWT.NONE);
		Layouts.setGrid(btnCmp).margin(0).numColumns(3);
		Layouts.newGridPlaceholder(btnCmp).grabHorizontal();
		Button okBtn = new Button(btnCmp, SWT.PUSH);
		okBtn.setText("OK");
		Layouts.setGridData(okBtn).widthHint(SwtMisc.defaultButtonWidth());
		okBtn.addListener(SWT.Selection, e -> {
			Errors.dialog().run(() -> {
				String txt = wordTxt.getText();
				Preconditions.checkArgument(!txt.contains(" "), "Cannot contain space");
				double time = Double.parseDouble(timeTxt.getText());
				replace(word, new Word.Vtt(txt, time));
				cmp.getShell().dispose();
			});
		});
		Button cancelBtn = new Button(btnCmp, SWT.PUSH);
		cancelBtn.setText("Cancel");
		Layouts.setGridData(cancelBtn).widthHint(SwtMisc.defaultButtonWidth());
		cancelBtn.addListener(SWT.Selection, e -> {
			cmp.getShell().dispose();
		});
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
		changed.onNext(SaidVtt.VTT);
		words.removeAll(vttWords);
		viewer.remove(vttWords.toArray());
	}

	public void replace(Word.Vtt vttOld, Word.Said said) {
		replace(vttOld, new Word.Vtt(said.lowercase(), vttOld.time()));
	}

	public void replace(Word.Vtt vttOld, Word.Vtt vttNew) {
		changed.onNext(SaidVtt.VTT);
		int idx = words.indexOf(vttOld);
		words.set(idx, vttNew);
		viewer.replace(vttNew, idx);
	}

	public void insert(int insertionPoint, Word.Said said) {
		changed.onNext(SaidVtt.VTT);
		double before = insertionPoint == 0 ? 0 : words.get(insertionPoint - 1).time();
		double after = words.get(insertionPoint).time();

		Word.Vtt newWord = new Word.Vtt(said.lowercase(), (before + after) / 2);
		words.add(insertionPoint, newWord);
		viewer.insert(newWord, insertionPoint);
	}

	public List<Word.Vtt> getWords() {
		return words;
	}
}
