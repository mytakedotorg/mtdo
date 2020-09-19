/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.fact.transcript;


import com.diffplug.common.io.Files;
import com.diffplug.common.math.DoubleMath;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.mytake.fact.transcript.VttTranscript.Mode;

/**
 * YouTube is now making lots of junky lines.
 * - removes all lines with no wordTime
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
			line.addWordsTo(wordsBuffer);
			double end;
			if (i != vtt.lines().size() - 1) {
				VttTranscript.Line nextLine = vtt.lines().get(i + 1);
				end = nextLine.header().start();
			} else {
				end = line.header().start();
				for (VttToken token : line.tokens()) {
					if (token.isTime()) {
						double newEnd = token.assertTime().timestamp;
						if (DoubleMath.fuzzyEquals(newEnd, end, 0.01)) {
							throw new IllegalArgumentException("Duplicate wordTime!" + token);
						}
						end = newEnd;
					}
				}
				end += VttTranscript.LAST_WORD_DURATION;
			}
			vtt.lines().set(i, VttTranscript.Line.create(line.header(), wordsBuffer, end));
		}
	}
}
