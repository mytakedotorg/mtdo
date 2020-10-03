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
package org.mytake.factset.video;


import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.collect.Immutables;
import com.diffplug.common.io.CharSource;
import com.diffplug.common.io.Files;
import com.google.auto.value.AutoValue;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Set;
import java2ts.FT.VideoFactMeta;
import org.mytake.factset.DisallowedValueException;
import org.mytake.factset.LocatedException;

/**
 * Format is:
 * 
 * ```
 * NAME: Content.
 * 
 * NAME: Content.
 * 
 * NAME: Content.
 * ```
 * @author ntwigg
 *
 */
@AutoValue
public abstract class SaidTranscript {
	public abstract List<Turn> turns();

	/** Returns words indexed against the raw format of the transcript. */
	public List<Word.Said> indexedWords() {
		List<Word.Said> attributed = new ArrayList<>();
		ListIterator<Turn> turnIter = turns().listIterator();
		int startIdx = 0;
		try {
			while (turnIter.hasNext()) {
				Turn turn = turnIter.next();
				startIdx += turn.speaker().length() + ": ".length();
				attributed.addAll(turn.indexedWords(startIdx));
				startIdx += turn.said().length() + 2; // for 2 newlines
			}
		} catch (Exception e) {
			throw new RuntimeException("On line " + (turnIter.previousIndex() * 2 + 1) + " of said", e);
		}
		return attributed;
	}

	@AutoValue
	public abstract static class Turn {
		public abstract String speaker();

		public abstract String said();

		/** Returns words indexed against the given start index. */
		public List<Word.Said> indexedWords(int startIdx) {
			String[] words = said().split(" ");
			List<Word.Said> saidWords = new ArrayList<>();
			for (String word : words) {
				Word.Said saidWord = new Word.Said(word, startIdx);
				if (!saidWord.lowercase.isEmpty()) {
					// make sure it's not just a "-"
					saidWords.add(saidWord);
				}
				startIdx += word.length() + 1;
			}
			return saidWords;
		}

		public static Turn turnWords(String speaker, String words) {
			return new AutoValue_SaidTranscript_Turn(speaker, words);
		}
	}

	public static SaidTranscript parse(File videoJson, VideoFactMeta meta, File file) throws IOException {
		return parse(videoJson, meta, Files.asByteSource(file).asCharSource(StandardCharsets.UTF_8));
	}

	public static SaidTranscript parse(File videoJson, VideoFactMeta meta, CharSource source) throws IOException {
		Set<String> people = meta.speakers.stream().map(s -> s.fullName).collect(Immutables.toSet());

		int lineCount = 1;
		try (BufferedReader reader = source.openBufferedStream()) {
			List<Turn> turns = new ArrayList<>();
			String line;
			while (true) {
				line = reader.readLine();
				if (line == null || line.isEmpty()) {
					break;
				}
				int firstColon = line.indexOf(':');
				if (firstColon == -1) {
					throw LocatedException.atLine(lineCount).message("Every paragraph should start with a speaker");
				}
				String speaker = line.substring(0, firstColon);
				if (!people.contains(speaker)) {
					throw LocatedException.atLine(lineCount).colRange(0, firstColon).message(DisallowedValueException.peopleInSaid(speaker, people, videoJson));
				}
				String words = line.substring(firstColon + 1).trim();
				turns.add(Turn.turnWords(speaker, words));

				++lineCount;
				String emptyLine = reader.readLine();
				if (emptyLine == null) {
					break;
				} else if (!emptyLine.isEmpty()) {
					throw LocatedException.atLine(lineCount).message("Must be a single empty line between speaker turns");
				}
				++lineCount;
			}
			return create(turns);
		}
	}

	public static SaidTranscript create(List<Turn> turns) {
		return new AutoValue_SaidTranscript(turns);
	}

	public void write(StringPrinter printer) {
		Iterator<Turn> turns = turns().iterator();
		while (turns.hasNext()) {
			Turn turn = turns.next();
			printer.print(turn.speaker() + ": ");
			printer.println(turn.said());
			if (turns.hasNext()) {
				printer.println("");
			}
		}
	}
}
