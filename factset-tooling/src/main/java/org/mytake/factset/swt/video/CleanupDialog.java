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
package org.mytake.factset.swt.video;


import com.diffplug.common.base.Box;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Throwables;
import com.diffplug.common.rx.RxBox;
import com.diffplug.common.swt.Coat;
import com.diffplug.common.swt.Corner;
import com.diffplug.common.swt.Fonts;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import com.diffplug.common.swt.SwtExec;
import com.diffplug.common.swt.SwtMisc;
import com.diffplug.common.swt.widgets.ButtonPanel;
import com.diffplug.common.swt.widgets.RadioGroup;
import com.diffplug.common.tree.TreeStream;
import java.io.FileNotFoundException;
import java.io.PrintWriter;
import java.util.function.Function;
import java.util.regex.Pattern;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Listener;
import org.mytake.factset.DisallowedValueException;
import org.mytake.factset.swt.Labels;
import org.mytake.factset.swt.TextViewCtl;
import org.mytake.factset.swt.VScrollCtl;
import org.mytake.factset.swt.Workbench;
import org.mytake.factset.video.SaidTranscript;

public class CleanupDialog {
	public static Exception forSaid(Workbench.Pane pane, TextViewCtl ctl, Exception e) {
		open(ctl, cmp -> {
			Throwable root = Throwables.getRootCause(e);
			if (root instanceof DisallowedValueException) {
				DisallowedValueException invalidSpeaker = (DisallowedValueException) root;
				new ChangeValueCoat(cmp, pane, ctl.txtBox(), invalidSpeaker);
			} else {
				new AdjustFormatCoat(cmp, pane, ctl.txtBox(), e);
			}
		});
		return e;
	}

	public static DisallowedValueException forDisallowedValue(Workbench.Pane pane, TextViewCtl ctl, DisallowedValueException e) {
		open(ctl, cmp -> new ChangeValueCoat(cmp, pane, ctl.txtBox(), e));
		return e;
	}

	private static void open(TextViewCtl ctl, Coat coat) {
		Shells.builder(SWT.APPLICATION_MODAL, cmp -> {
			coat.putOn(cmp);
			Listener closeOnEsc = e -> {
				if (e.keyCode == SWT.ESC) {
					cmp.getShell().dispose();
				}
			};
			cmp.getDisplay().addFilter(SWT.KeyDown, closeOnEsc);
			cmp.getShell().addListener(SWT.Dispose, e -> cmp.getDisplay().removeFilter(SWT.KeyDown, closeOnEsc));
		})
				.setLocation(Corner.BOTTOM_RIGHT, Corner.BOTTOM_RIGHT.getPosition(ctl))
				.openOn(ctl.getShell());
	}

	private static class ChangeValueCoat {
		ChangeValueCoat(Composite cmp, Workbench.Pane pane, Box<String> doc, DisallowedValueException exc) {
			Layouts.setGrid(cmp);
			Layouts.setGridData(Labels.createBold(cmp, "Replace " + exc.kind() + " '" + exc.value + "'")).grabHorizontal();

			Composite btnCmp;
			if (exc.allowed.size() > 5) {
				VScrollCtl vscroll = new VScrollCtl(cmp, SWT.BOLD);
				Layouts.setGridData(vscroll).grabHorizontal().heightHint(SwtMisc.systemFontHeight() * 9);
				btnCmp = new Composite(vscroll.getParentForContent(), SWT.NONE);
				vscroll.setContent(btnCmp);
				Layouts.setGrid(btnCmp);
			} else {
				btnCmp = cmp;
			}
			for (String candidate : exc.allowed) {
				Button btn = new Button(btnCmp, SWT.PUSH);
				btn.setText(candidate);
				btn.addListener(SWT.Selection, e -> {
					cmp.getShell().dispose();
					// fix the speaker and run again
					exc.replaceValueWithAllowed(candidate, doc);
					pane.triggerSave();
				});
				Layouts.setGridData(btn).grabHorizontal();
			}

			Labels.createHSep(cmp);

			Button openJson = new Button(cmp, SWT.PUSH);
			openJson.setText("OR open " + exc.fileWhichSpecifies.getName() + " to add");
			openJson.addListener(SWT.Selection, e -> {
				cmp.getShell().dispose();
				pane.workbench().openFile(exc.fileWhichSpecifies.toPath());
				pane.logOpDontBlock("Missing " + exc.kind(), printer -> {
					printer.println(exc.value);
				});
			});
			Layouts.setGridData(openJson).grabHorizontal();
		}
	}

	private static class AdjustFormatCoat {
		private final String orig;
		private final RadioGroup<StrBox> options;

		private static final String ORIGINAL = "Original";

		AdjustFormatCoat(Composite cmp, Workbench.Pane pane, Box<String> doc, Exception e) {
			Layouts.setGrid(cmp);
			String message;
			if (e instanceof FileNotFoundException) {
				int lastSlash = e.getMessage().replace('\\', '/').lastIndexOf('/');
				message = "File not found: " + e.getMessage().substring(lastSlash);
			} else {
				message = e.getMessage();
				if (message == null) {
					message = e.getClass().toString();
				}
			}
			Layouts.setGridData(Labels.createBold(cmp, message)).grabHorizontal();

			Layouts.setGridData(Labels.create(cmp, "One of the following find-replace actions might help."));

			orig = doc.get();
			options = RadioGroup.create();
			options.addOption(new StrBox(orig), ORIGINAL);
			options.addOption(new StrBox(SaidTranscript.mergeParagraphs(orig)), "Rollup paragraphs without speaker");
			addRegex("^(.+): \\([\\d:]+\\)\\n", "$1: ");

			RxBox<StrBox> theString = options.buildOn(cmp);
			ButtonPanel panel = ButtonPanel.builder()
					.add("Take", () -> {
						cmp.getShell().dispose();
						pane.triggerSave();
					})
					.add("Cancel", () -> {
						doc.set(orig);
						cmp.getShell().dispose();
					})
					.build(cmp);
			Layouts.setGridData(panel).grabHorizontal();

			TreeStream.depthFirst(SwtMisc.treeDefControl(), cmp)
					.filter(ctl -> ctl instanceof Button && SwtMisc.flagIsSet(SWT.RADIO, ctl))
					.map(ctl -> (Button) ctl)
					.filter(btn -> !btn.getText().equals(ORIGINAL))
					.forEach(btn -> btn.setFont(Fonts.systemMonospace()));

			SwtExec.immediate().guardOn(cmp).subscribe(theString, strBox -> {
				String str = strBox.content;
				panel.getButtons().get(0).setEnabled(!str.equals(orig));
				doc.set(str);
			});
		}

		void addRegex(String pattern, String replacement) {
			addMessage("s/" + pattern + "/" + replacement + "/gm", in -> {
				return Pattern.compile(pattern, Pattern.MULTILINE).matcher(in).replaceAll(replacement);
			});
		}

		void addMessage(String name, Function<String, String> modify) {
			try {
				options.addOption(new StrBox(modify.apply(orig)), name);
			} catch (Exception e) {
				options.addOption(new StrBox(StringPrinter.buildString(printer -> {
					try (PrintWriter writer = printer.toPrintWriter()) {
						e.printStackTrace(writer);
					}
				})), name);
			}
		}
	}

	/** Little box so that strings aren't equal to themselves. */
	private static class StrBox {
		final String content;

		StrBox(String content) {
			this.content = content;
		}
	}
}
