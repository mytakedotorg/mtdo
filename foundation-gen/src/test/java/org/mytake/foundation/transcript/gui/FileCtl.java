/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Files;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Layouts;
import io.reactivex.Observable;
import io.reactivex.subjects.PublishSubject;
import java.io.File;
import java.nio.charset.StandardCharsets;
import org.eclipse.swt.SWT;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Text;

public class FileCtl extends ControlWrapper.AroundControl<Composite> {
	private final File file;
	private final Button save;
	private final PublishSubject<FileCtl> savePressed = PublishSubject.create();

	public FileCtl(Composite parent, File file) {
		super(new Composite(parent, SWT.NONE));
		this.file = file;
		Layouts.setGrid(wrapped).numColumns(2).margin(0);
		Text txt = new Text(wrapped, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		txt.setText(file.getName());
		Layouts.setGridData(txt).grabHorizontal();

		save = new Button(wrapped, SWT.PUSH | SWT.FLAT);
		save.setText("Save");
		save.setEnabled(false);
		save.addListener(SWT.Selection, e -> {
			savePressed.onNext(this);
		});
	}

	public Observable<FileCtl> savePressed() {
		return savePressed;
	}

	public void hasChanged() {
		save.setEnabled(true);
	}

	public String read() {
		return Errors.rethrow().get(() -> {
			return Files.asByteSource(file).asCharSource(StandardCharsets.UTF_8).read();
		}).replace("\r", "");
	}

	public void save(String content) {
		Errors.rethrow().run(() -> {
			Files.write(content.replace("\r", "").getBytes(StandardCharsets.UTF_8), file);
		});
	}
}
