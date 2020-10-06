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
package org.mytake.factset.swt;


import com.diffplug.common.base.Errors;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.SwtExec;
import com.diffplug.common.swt.SwtMisc;
import java.util.Optional;
import java.util.function.Consumer;
import javax.annotation.Nullable;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Color;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Label;
import org.mytake.factset.LocatedException;
import org.mytake.factset.swt.Workbench.Pane;

public class ProgressCtl extends ControlWrapper.AroundControl<Label> {
	private final Workbench workbench;

	private final Color IN_PROGRESS, SUCCESS, ERROR;

	public ProgressCtl(Composite parent, Workbench workbench) {
		super(new Label(parent, SWT.NONE));
		this.workbench = workbench;

		IN_PROGRESS = SwtMisc.getSystemColor(SWT.COLOR_BLACK);
		SUCCESS = SwtMisc.getSystemColor(SWT.COLOR_DARK_GREEN);
		ERROR = SwtMisc.getSystemColor(SWT.COLOR_RED);
		wrapped.setForeground(SUCCESS);
	}

	@Nullable
	Workbench.Pane pane;

	public Consumer<Optional<Throwable>> begin(@Nullable Workbench.Pane pane, String operation) {
		wrapped.setText(operation);
		wrapped.setForeground(IN_PROGRESS);
		wrapped.requestLayout();
		this.pane = pane;
		return errorOpt -> SwtExec.async().execute(() -> {
			if (errorOpt.isPresent()) {
				wrapped.setForeground(ERROR);
				wrapped.setText(operation + ": " + errorMaxLength(errorOpt.get()));
				handleError(errorOpt.get());
			} else {
				wrapped.setForeground(SUCCESS);
				wrapped.setText(operation + ": Success!");
			}
			wrapped.requestLayout();
		});
	}

	private String errorMaxLength(Throwable e) {
		String msg = e.getMessage();
		if (msg == null) {
			return e.getClass().toString();
		} else if (msg.length() > 15) {
			return msg.substring(0, 15) + "...";
		} else {
			return msg;
		}
	}

	private void handleError(Throwable e) {
		e.printStackTrace();
		/*
		if (tabFolder.getShell() == SwtMisc.assertUI().getActiveShell()) {
			// there isn't an error dialog, so we need to open one
			SwtMisc.blockForError(e.getMessage(), e.getMessage());
		}
		*/
		if (e instanceof LocatedException) {
			// makes sure that highlight always triggers on the UI thread
			LocatedException located = (LocatedException) e;
			if (pane != null && (located.file == null || PaneInput.path(located.file).equals(pane.input))) {
				pane.exec.execute(() -> pane.highlight.onNext(located.loc));
			} else {
				Pane newPane = workbench.openFile(located.file);
				SwtExec.async().execute(() -> {
					// let the file open, then highlight it there
					newPane.highlight.onNext(located.loc);
				});
			}
		} else if (e instanceof ShellExec.ExitCodeNotZeroException) {
			ShellExec.ExitCodeNotZeroException shellException = (ShellExec.ExitCodeNotZeroException) e;
			if (shellException.paneInput != null) {
				workbench.open(shellException.paneInput);
			} else {
				Errors.dialog().accept(e);
			}
		}
	}
}
