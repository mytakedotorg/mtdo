/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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


import com.diffplug.common.base.Errors;
import com.diffplug.common.swt.ControlWrapper;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.eclipse.jface.text.Document;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Composite;
import org.mytake.factset.gui.Workbench.Pane;

class ContentTypes {
	static ControlWrapper createPane(Composite cmp, Path path, Pane pane) {
		String content = Errors.rethrow().get(() -> new String(Files.readAllBytes(path), StandardCharsets.UTF_8));

		SyntaxHighlighter highlighter = SyntaxHighlighter.none();
		String filename = path.getFileName().toString();
		if (filename.endsWith(".json")) {
			highlighter = SyntaxHighlighter.json();
		} else if (filename.endsWith(".ini")) {
			highlighter = SyntaxHighlighter.ini();
		}

		Document doc = new Document(content);
		TextViewCtl ctl = new TextViewCtl(cmp);
		ctl.setup(doc, highlighter);
		ctl.getSourceViewer().getTextWidget().addListener(SWT.Modify, e -> pane.makeDirty());

		pane.exec.subscribe(pane.save, s -> {
			Errors.dialog().run(() -> {
				Files.write(path, doc.get().replace("\r", "").getBytes(StandardCharsets.UTF_8));
			});
		});
		return ctl;
	}

}
