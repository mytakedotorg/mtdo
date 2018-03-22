/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import java.io.File;
import java.util.List;
import java.util.function.UnaryOperator;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.SaidTranscript;
import org.mytake.foundation.transcript.Word;
import org.mytake.foundation.transcript.Word.Vtt;

public class SaidCtl extends ControlWrapper.AroundControl<Composite> {
	private final FileCtl fileCtl;
	private final Text styled;

	public SaidCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0);

		fileCtl = new FileCtl(wrapped, "Said");
		Layouts.setGridData(fileCtl).grabHorizontal();

		styled = new Text(wrapped, SWT.MULTI | SWT.BORDER | SWT.V_SCROLL | SWT.WRAP);
		Layouts.setGridData(styled).grabAll();
		styled.addListener(SWT.Modify, e -> {
			fileCtl.hasChanged();
		});
	}

	public void setFile(File file, SaidTranscript said) {
		fileCtl.setFile(file);
		styled.setText(fileCtl.read());
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
			return txt;
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
