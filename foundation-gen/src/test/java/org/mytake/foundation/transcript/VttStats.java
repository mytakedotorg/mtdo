/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018 MyTake.org, Inc.
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

import com.diffplug.common.base.Either;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import org.eclipse.jgit.diff.Edit;

public class VttStats {
	public static void main(String[] args) throws IOException {
		TranscriptFolder folder = new TranscriptFolder(new File("../presidential-debates"));
		for (String name : folder.transcripts()) {
			TranscriptMatch match = folder.loadTranscript(name);
			for (Edit edit : match.edits()) {
				String said = toString(match.saidFor(edit));
				String vtt = toString(match.vttFor(edit));
				System.out.println(said + "->" + vtt);
			}
		}
	}

	private static String toString(Either<?, Integer> either) {
		if (either.isRight()) {
			return "";
		} else {
			@SuppressWarnings("unchecked")
			List<Word> words = (List<Word>) either.getLeft();
			return words.stream().map(w -> w.lowercase).collect(Collectors.joining(" "));
		}
	}
}
