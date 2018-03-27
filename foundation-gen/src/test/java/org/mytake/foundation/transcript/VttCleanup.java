/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.io.Files;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.mytake.foundation.transcript.VttTranscript.Mode;

/**
 * YouTube is now making lots of junky lines.
 * - removes all lines with no timestamps
 * - removes all style tokens
 * - removes all punctuation
 * - makes all tokens lowercase
 */
public class VttCleanup {
	public static void main(String[] args) throws IOException {
		TranscriptFolder folder = new TranscriptFolder(new File("../presidential-debates"));
		for (String name : folder.transcriptsWithMeta()) {
			try {
				VttTranscript vtt = VttTranscript.parse(folder.fileVtt(name), Mode.PERMISSIVE);
				normalizeLines(vtt);
				normalizeLines(vtt);
				Files.write(vtt.asString().getBytes(StandardCharsets.UTF_8), folder.fileVtt(name));
				System.out.println(name + " SUCCESS");
			} catch (Exception e) {
				System.out.println(name + " " + e.getMessage());
				e.printStackTrace();
			}
		}
	}

	private static void normalizeLines(VttTranscript vtt) {
		List<Word.Vtt> wordsBuffer = new ArrayList<>();
		for (int i = 0; i < vtt.lines().size(); ++i) {
			wordsBuffer.clear();
			VttTranscript.Line line = vtt.lines().get(i);
			line.addWords(wordsBuffer);
			double end;
			if (i != vtt.lines().size() - 1) {
				VttTranscript.Line nextLine = vtt.lines().get(i + 1);
				end = nextLine.header().start();
			} else {
				end = line.header().start();
				for (VttToken token : line.tokens()) {
					if (token.isTime()) {
						end = token.assertTime().timestamp;
					}
				}
				end += VttTranscript.LAST_WORD_DURATION;
			}
			vtt.lines().set(i, VttTranscript.Line.create(line.header(), wordsBuffer, end));
		}
	}
}
