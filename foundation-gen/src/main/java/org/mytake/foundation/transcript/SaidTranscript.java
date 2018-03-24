/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.io.ByteSource;
import com.diffplug.common.io.Files;
import com.google.auto.value.AutoValue;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.ListIterator;
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

	public List<Word.Said> attributedWords() {
		List<Word.Said> attributed = new ArrayList<>();
		ListIterator<Turn> turnIter = turns().listIterator();
		int startIdx = 0;
		while (turnIter.hasNext()) {
			Turn turn = turnIter.next();
			startIdx += turn.speaker().length() + ": ".length();
			List<String> words = turn.words();
			for (String word : words) {
				Word.Said saidWord = new Word.Said(word, startIdx);
				if (!saidWord.lowercase.isEmpty()) {
					// make sure it's not just a "-"
					attributed.add(saidWord);
				}
				startIdx += word.length() + 1;
			}
			startIdx += 1; // for 2 newlines
		}
		return attributed;
	}

	@AutoValue
	public abstract static class Turn {
		public abstract String speaker();

		public abstract String said();

		public List<String> words() {
			return Arrays.asList(said().split(" "));
		}

		public static Turn speakerWords(String speaker, String words) {
			return new AutoValue_SaidTranscript_Turn(speaker, words);
		}
	}

	public static SaidTranscript parse(VideoFactMeta meta, File file) throws IOException {
		return parse(meta, Files.asByteSource(file));
	}

	public static SaidTranscript parse(VideoFactMeta meta, ByteSource source) throws IOException {
		int lineCount = 1;
		try (BufferedReader reader = source.asCharSource(StandardCharsets.UTF_8).openBufferedStream()) {
			List<Turn> turns = new ArrayList<>();
			String line;
			while (!(line = reader.readLine()).isEmpty()) {
				int firstColon = line.indexOf(':');
				String speaker = line.substring(0, firstColon);
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
