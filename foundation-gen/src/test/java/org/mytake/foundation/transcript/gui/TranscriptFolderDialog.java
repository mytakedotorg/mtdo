/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.swt.Corner;
import com.diffplug.common.swt.Fonts;
import com.diffplug.common.swt.Layouts;
import com.diffplug.common.swt.Shells;
import java.io.File;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.SashForm;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.DirectoryDialog;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.Text;
import org.mytake.foundation.transcript.TranscriptFolder;

public class TranscriptFolderDialog {
	private final Text transcriptTxt;
	private final Text folderTxt;
	private final Button saveBtn, refreshBtn;
	private final TranscriptCtl transcriptCtl;

	private TranscriptFolderDialog(Composite parent) {
		Layouts.setGrid(parent).margin(0).spacing(0);
		SashForm top = new SashForm(parent, SWT.HORIZONTAL);
		Layouts.setGridData(top).grabHorizontal();

		Label sep = new Label(parent, SWT.SEPARATOR | SWT.HORIZONTAL);
		Layouts.setGridData(sep).grabHorizontal();

		transcriptCtl = new TranscriptCtl(parent);
		Layouts.setGridData(transcriptCtl).grabAll();

		Composite folderCmp = new Composite(top, SWT.NONE);
		Layouts.setGrid(folderCmp).margin(0).numColumns(3);
		Labels.create(folderCmp, "Folder").setFont(Fonts.systemBold());
		folderTxt = new Text(folderCmp, SWT.SINGLE | SWT.READ_ONLY | SWT.BORDER);
		Layouts.setGridData(folderTxt).grabHorizontal();
		Button folderBtn = new Button(folderCmp, SWT.PUSH);
		folderBtn.setText("...");
		folderBtn.addListener(SWT.Selection, e -> {
			DirectoryDialog dialog = new DirectoryDialog(parent.getShell());
			dialog.setFilterPath(folderTxt.getText());
			String newDir = dialog.open();
			if (newDir != null) {
				setFolder(new File(newDir));
			}
		});

		Composite transcriptCmp = new Composite(top, SWT.NONE);
		Layouts.setGrid(transcriptCmp).margin(0).numColumns(5);

		Label label = Labels.create(transcriptCmp, "Transcript");
		label.setFont(Fonts.systemBold());
		Layouts.setGridData(label).horizontalIndent(Layouts.defaultMargin());
		transcriptTxt = new Text(transcriptCmp, SWT.SINGLE | SWT.READ_ONLY | SWT.BORDER);
		Layouts.setGridData(transcriptTxt).grabHorizontal();
		Button transcriptBtn = new Button(transcriptCmp, SWT.PUSH);
		transcriptBtn.setText("...");
		transcriptBtn.addListener(SWT.Selection, e -> {
			Shells.builder(SWT.DIALOG_TRIM | SWT.APPLICATION_MODAL, this::openOptions)
					.setTitle("Transcript details")
					.setLocation(Corner.TOP_LEFT, Corner.BOTTOM_LEFT.getPosition(label))
					.openOnActive();
		});
		saveBtn = new Button(transcriptCmp, SWT.PUSH);
		saveBtn.setText("Save");
		saveBtn.setEnabled(false);

		refreshBtn = new Button(transcriptCmp, SWT.PUSH);
		refreshBtn.setText("Refresh");
		refreshBtn.setEnabled(false);
		refreshBtn.addListener(SWT.Selection, e -> {

		});
	}

	private void openOptions(Composite parent) {
		Layouts.setGrid(parent);

	}

	private TranscriptFolder folder;
	private String transcript;

	private void setFolder(File folder) {
		Errors.rethrow().run(() -> {
			File canoncial = folder.getCanonicalFile();
			this.folder = new TranscriptFolder(canoncial);
			this.folderTxt.setText(canoncial.getAbsolutePath());
		});
	}

	public static void main(String[] args) {
		Shells.builder(SWT.SHELL_TRIM, cmp -> {
			TranscriptFolderDialog dialog = new TranscriptFolderDialog(cmp);
			dialog.setFolder(new File("../presidential-debates"));
		})
				.setTitle("MyTake.org Transcript Editor")
				.openOnDisplayBlocking();
	}
}