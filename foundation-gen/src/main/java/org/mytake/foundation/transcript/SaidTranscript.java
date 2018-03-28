/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.collect.Immutables;
import com.diffplug.common.io.ByteSource;
import com.diffplug.common.io.Files;
import com.google.auto.value.AutoValue;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.Set;
import java2ts.Foundation.VideoFactMeta;

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

		public static Turn speakerWords(String speaker, String words) {
			return new AutoValue_SaidTranscript_Turn(speaker, words);
		}
	}

	public static SaidTranscript parse(VideoFactMeta meta, File file) throws IOException {
		return parse(meta, Files.asByteSource(file));
	}

	public static SaidTranscript parse(VideoFactMeta meta, ByteSource source) throws IOException {
		Set<String> people = meta.speakers.stream().map(s -> s.fullName).collect(Immutables.toSet());

		int lineCount = 1;
		try (BufferedReader reader = source.asCharSource(StandardCharsets.UTF_8).openBufferedStream()) {
			List<Turn> turns = new ArrayList<>();
			String line;
			while (true) {
				line = reader.readLine();
				if (line == null || line.isEmpty()) {
					break;
				}
				int firstColon = line.indexOf(':');
				String speaker = line.substring(0, firstColon);
				Preconditions.checkArgument(people.contains(speaker), "No such person %s, available: %s", speaker, people);
				String words = line.substring(firstColon + 1).trim();
				turns.add(Turn.speakerWords(speaker, words));

				++lineCount;
				String emptyLine = reader.readLine();
				if (emptyLine == null) {
					break;
				} else {
					Preconditions.checkArgument(emptyLine.isEmpty(), "Must be empty, but was %s", emptyLine);
				}
				++lineCount;
			}
			return new AutoValue_SaidTranscript(turns);
		} catch (Exception e) {
			throw new RuntimeException("On line " + lineCount, e);
		}
	}
}
