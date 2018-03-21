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
import java.util.Arrays;
import java.util.List;
import java.util.ListIterator;

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
		while (turnIter.hasNext()) {
			Turn turn = turnIter.next();
			List<String> words = turn.words();
			int startIdx = 0;
			for (String word : words) {
				attributed.add(new Word.Said(word, turnIter.previousIndex(), startIdx));
				startIdx += word.length() + 1;
			}
		}
		return attributed;
	}

	@AutoValue
	public abstract static class Turn {
		public abstract Speaker speaker();

		public abstract String said();

		public List<String> words() {
			return Arrays.asList(said().split(" "));
		}

		public static Turn speakerWords(Speaker speaker, String words) {
			return new AutoValue_SaidTranscript_Turn(speaker, words);
		}
	}

	public static SaidTranscript parse(File file) throws IOException {
		return parse(Files.asByteSource(file));
	}

	public static SaidTranscript parse(ByteSource source) throws IOException {
		int lineCount = 1;
		try (BufferedReader reader = source.asCharSource(StandardCharsets.UTF_8).openBufferedStream()) {
			List<Turn> turns = new ArrayList<>();
			String line;
			while (!(line = reader.readLine()).isEmpty()) {
				int firstColon = line.indexOf(':');
				String speakerName = line.substring(0, firstColon);
				Speaker speaker = Speaker.forName(speakerName);
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

	public List<Speaker> toSpeakers() {
		return turns().stream().map(Turn::speaker).collect(Immutables.toSortedSet(Speaker.ordering())).asList();
	}
}
