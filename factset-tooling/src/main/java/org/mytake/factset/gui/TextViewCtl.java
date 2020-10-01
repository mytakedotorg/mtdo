/*
 * MyTake.org website and tooling.
 * Copyright (C) 2011-2020 MyTake.org, Inc.
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
package org.mytake.factset.gui;


import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Fonts;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.SwtMisc;
import org.eclipse.jface.text.CursorLinePainter;
import org.eclipse.jface.text.IDocument;
import org.eclipse.jface.text.IFindReplaceTarget;
import org.eclipse.jface.text.source.CompositeRuler;
import org.eclipse.jface.text.source.DefaultCharacterPairMatcher;
import org.eclipse.jface.text.source.LineNumberRulerColumn;
import org.eclipse.jface.text.source.MatchingCharacterPainter;
import org.eclipse.jface.text.source.SourceViewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.graphics.Font;
import org.eclipse.swt.graphics.RGB;
import org.eclipse.swt.widgets.Composite;

public class TextViewCtl extends ControlWrapper.AroundControl<Composite> {
	final SourceViewer sourceViewer;
	private final CompositeRuler verticalRuler;

	public TextViewCtl(Composite parent) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).margin(0).spacing(0);

		// make the vertical line number thing
		Font font = Fonts.systemMonospace();
		verticalRuler = new CompositeRuler();
		LineNumberRulerColumn lineNumbers = new LineNumberRulerColumn();
		setLineNumberColors(lineNumbers, font);
		verticalRuler.addDecorator(0, lineNumbers);

		// make the source viewer
		sourceViewer = new SourceViewer(wrapped, verticalRuler, SWT.BORDER | SWT.V_SCROLL | SWT.H_SCROLL);
		Layouts.setGridData(sourceViewer.getControl()).grabAll();
		sourceViewer.getTextWidget().setFont(font);
		sourceViewer.setEditable(true);

		// bracket matching
		addBracketMatching(sourceViewer);

		// current line highlighting
		CursorLinePainter cursorPainter = new CursorLinePainter(sourceViewer);
		cursorPainter.setHighlightColor(new Color(RGB_HIGHLIGHT));
		sourceViewer.addPainter(cursorPainter);

		// handle select-all properly
		selectAll(sourceViewer);
	}

	private static final RGB RGB_HIGHLIGHT = new RGB(232, 242, 254);

	public static void setLineNumberColors(LineNumberRulerColumn column, Font font) {
		column.setFont(font);
		column.setForeground(SwtMisc.getSystemColor(SWT.COLOR_BLACK));
		column.setBackground(SwtMisc.getSystemColor(SWT.COLOR_WIDGET_BACKGROUND));
	}

	static void selectAll(SourceViewer viewer) {
		viewer.getTextWidget().addListener(SWT.KeyDown, event -> {
			if (Accelerators.checkKey(event, Accelerators.SELECT_ALL)) {
				viewer.getTextWidget().selectAll();
			} else if (Accelerators.checkKey(event, Accelerators.REDO)) {
				viewer.getUndoManager().redo();
			} else if (Accelerators.checkKey(event, Accelerators.UNDO)) {
				viewer.getUndoManager().undo();
			}
		});
	}

	public boolean setFocus() {
		wrapped.setFocus();
		return sourceViewer.getTextWidget().setFocus();
	}

	/** Sets the contents of the TextViewerCmp to view the given file and syntax highlighting rules. */
	public void setup(IDocument doc, SyntaxHighlighter highlighter) {
		sourceViewer.getTextWidget().setWordWrap(true);
		sourceViewer.addPainter(new WhitespacePainter(sourceViewer, false));
		highlighter.setup(sourceViewer, doc);
	}

	public SourceViewer getSourceViewer() {
		return sourceViewer;
	}

	public IFindReplaceTarget getFindReplaceTarget() {
		return sourceViewer.getFindReplaceTarget();
	}

	/** Adds bracket-matching capabilities to the given SourceViewer. */
	private static void addBracketMatching(SourceViewer viewer) {
		DefaultCharacterPairMatcher bracketMatcher = new DefaultCharacterPairMatcher(new char[]{'{', '}', '(', ')', '<', '>', '[', ']'});
		MatchingCharacterPainter bracketPainter = new MatchingCharacterPainter(viewer, bracketMatcher);
		bracketPainter.setColor(viewer.getTextWidget().getDisplay().getSystemColor(SWT.COLOR_DARK_GRAY));
		viewer.addPainter(bracketPainter);
	}
}
