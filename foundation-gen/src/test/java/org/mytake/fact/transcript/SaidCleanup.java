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
package org.mytake.fact.transcript;

import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.io.Files;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java2ts.FT.VideoFactMeta;
import org.mytake.fact.transcript.SaidTranscript.Turn;

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
				Iterator<Turn> turns = said.turns().iterator();

				Turn last = turns.next();
				List<Turn> clean = new ArrayList<>(said.turns().size());
				while (turns.hasNext()) {
					Turn next = turns.next();
					if (last.speaker().equals(next.speaker())) {
						last = Turn.turnWords(last.speaker(), last.said() + " " + next.said());
					} else {
						clean.add(last);
						last = next;
					}
				}
				clean.add(last);

				String cleanString = StringPrinter.buildString(SaidTranscript.create(clean)::write);
				Files.write(cleanString.getBytes(StandardCharsets.UTF_8), folder.fileSaid(name));
			} catch (Exception e) {
				System.out.println(name + " " + e.getMessage());
				e.printStackTrace();
			}
		}
	}
}
