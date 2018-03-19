/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import com.google.auto.value.AutoValue;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

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
public abstract class SpeakersTranscript {
	public abstract List<Turn> turns();

	@AutoValue
	public abstract static class Turn {
		public abstract Speaker speaker();

		public abstract String words();

		public static Turn speakerWords(Speaker speaker, String words) {
			return new AutoValue_SpeakersTranscript_Turn(speaker, words);
		}
	}

	public static SpeakersTranscript parse(String toRead) throws IOException {
		try (BufferedReader reader = new BufferedReader(new StringReader(toRead))) {
			return parse(reader);
		}
	}

	public static SpeakersTranscript parse(BufferedReader reader) throws IOException {
		int lineCount = 1;
		try {
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
			return new AutoValue_SpeakersTranscript(turns);
		} catch (Exception e) {
			throw new RuntimeException("On line " + lineCount, e);
		}
	}
}