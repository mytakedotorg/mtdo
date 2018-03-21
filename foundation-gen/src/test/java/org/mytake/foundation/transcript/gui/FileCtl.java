/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.base.Errors;
import com.diffplug.common.base.StandardSystemProperty;
import com.diffplug.common.io.Files;
import com.diffplug.common.swt.ControlWrapper;
import com.diffplug.common.swt.Fonts;
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
	private File file;
	private final Text txt;
	private final Button save;
	private final PublishSubject<FileCtl> savePressed = PublishSubject.create();

	public FileCtl(Composite parent, String label) {
		super(new Composite(parent, SWT.NONE));
		Layouts.setGrid(wrapped).numColumns(3).margin(0);

		Labels.create(wrapped, label).setFont(Fonts.systemBold());

		txt = new Text(wrapped, SWT.BORDER | SWT.SINGLE | SWT.READ_ONLY);
		Layouts.setGridData(txt).grabHorizontal();

		save = new Button(wrapped, SWT.PUSH | SWT.FLAT);
		save.setText("Save");
		save.setEnabled(false);
		save.addListener(SWT.Selection, e -> {
			savePressed.onNext(this);
		});
	}

	public void setFile(File file) {
		this.file = file;
		String path = file.getAbsolutePath().replace(StandardSystemProperty.USER_HOME.value(), "~");
		txt.setText(path);
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
