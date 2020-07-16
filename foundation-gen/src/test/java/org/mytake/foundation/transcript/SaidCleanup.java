/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.io.Files;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java2ts.Foundation.VideoFactMeta;

/**
 * Makes sure that:
 * - .said is parsing correctly
 * - no duplicate consecutive speakers
 */
public class SaidCleanup {
	public static void main(String[] args) throws IOException {
		TranscriptFolder folder = new TranscriptFolder(new File("../presidential-debates"));
		for (String name : folder.transcriptsWithMeta()) {
			try {
				VideoFactMeta meta = folder.loadMetaNoValidation(name);
				SaidTranscript said = SaidTranscript.parse(meta, folder.fileSaid(name));
				String clean = StringPrinter.buildString(said::write);
				Files.write(clean.getBytes(StandardCharsets.UTF_8), folder.fileSaid(name));
			} catch (Exception e) {
				System.out.println(name + " " + e.getMessage());
				e.printStackTrace();
			}
		}
	}
}
