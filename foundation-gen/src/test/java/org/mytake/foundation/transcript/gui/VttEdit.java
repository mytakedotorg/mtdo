/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.io.Files;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import org.mytake.foundation.transcript.VttTranscript;
import org.mytake.foundation.transcript.VttTranscript.Mode;
import org.mytake.foundation.transcript.Word;

public class VttEdit {
	public static void main(String[] args) throws IOException {
		VttTranscript transcript = VttTranscript.parse(new File("../presidential-debates/2000-10-17.backup"), Mode.STRICT);
		List<Word.Vtt> newWords = transcript.words().stream()
				.map(vtt -> vtt.time() < 3498.389 ? vtt : new Word.Vtt(vtt.lowercase(), vtt.time() + 10))
				.collect(Collectors.toList());
		transcript.save(newWords, Files.asCharSink(new File("../presidential-debates/2000-10-17.vtt"), StandardCharsets.UTF_8));
	}
}
