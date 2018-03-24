/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.jface.ColumnViewerFormat;
import io.reactivex.subjects.PublishSubject;
import java.util.Arrays;
import java.util.List;
import org.eclipse.jface.viewers.ArrayContentProvider;
import org.eclipse.jface.viewers.StructuredSelection;
import org.eclipse.jface.viewers.TableViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.TranscriptMatch;
import org.mytake.foundation.transcript.Word;

public class VttCtl extends ControlWrapper.AroundControl<Composite> {
	private PublishSubject<SaidVtt> changed;

	private final Button addBtn;
	private final Text addTxt;
	private final TableViewer viewer;

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
		time.addColumn().setText("Time").setLabelProviderText(word -> String.format("%.3f", word.time())).setLayoutPixel(6 * SwtMisc.systemFontWidth());
		time.addColumn().setText("Word").setLabelProviderText(word -> word.lowercase()).setLayoutWeight(1);
		time.setHeaderVisible(true);
		time.setLinesVisible(true);
		time.setUseHashLookup(true);
		time.setStyle(SWT.MULTI);
		viewer = time.buildTable(tableCmp);
		viewer.setContentProvider(ArrayContentProvider.getInstance());

		viewer.addSelectionChangedListener(e -> {
			int[] selection = viewer.getTable().getSelectionIndices();
			Arrays.sort(selection);
			int minIdx = selection[0];
			int maxIdx = Math.min(selection[selection.length - 1] + 1, match.vttWords().size() - 1);
			youtube.play(match.vttWords().get(minIdx).time(), match.vttWords().get(maxIdx).time());
		});
	}

	private TranscriptMatch match;

	public void setFile(TranscriptMatch match) {
		this.match = match;
		viewer.setInput(match.vttWords());
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
		match.vttWords().removeAll(vttWords);
		viewer.remove(vttWords.toArray());
	}

	public void replace(Word.Vtt vttOld, Word.Said said) {
		changed.onNext(SaidVtt.VTT);
		Word.Vtt vttNew = new Word.Vtt(said.lowercase(), vttOld.time());
		int idx = match.vttWords().indexOf(vttOld);
		match.vttWords().set(idx, vttNew);
		viewer.replace(vttNew, idx);
	}

	public void insert(int insertionPoint, Word.Said said) {
		changed.onNext(SaidVtt.VTT);
		double before = insertionPoint == 0 ? 0 : match.vttWords().get(insertionPoint - 1).time();
		double after = match.vttWords().get(insertionPoint).time();

		Word.Vtt newWord = new Word.Vtt(said.lowercase(), (before + after) / 2);
		match.vttWords().add(insertionPoint, newWord);
		viewer.insert(newWord, insertionPoint);
	}
}
