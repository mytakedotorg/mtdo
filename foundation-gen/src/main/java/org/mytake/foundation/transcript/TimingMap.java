/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import java.io.IOException;
import java.util.List;
import org.mytake.foundation.diff.JGitListDiffer;
import org.mytake.foundation.diff.ListChange;
import org.mytake.foundation.diff.Side;

public class TimingMap {
	public static TimingMap parseName(String name) throws IOException {
		return new TimingMap(SpeakersTranscript.parseName(name), VttTranscript.parseName(name));
	}

	private final SpeakersTranscript speakers;
	private final VttTranscript timing;
	private final List<WordTime> speakersSeq, timingSeq;

	private TimingMap(SpeakersTranscript speakers, VttTranscript timing) {
		this.speakers = speakers;
		this.timing = timing;
		this.speakersSeq = speakers.words();
		this.timingSeq = timing.words();

		List<ListChange> changes = JGitListDiffer.myersDiff().diffOn(speakersSeq, timingSeq, word -> word.lowercase);
		for (ListChange change : changes) {
			if (change.getType().isIdentical()) {
				List<WordTime> words = change.subList(speakersSeq, Side.BEFORE);
				System.out.println("EQUAL:" + toString(words));
			} else {
				System.out.println("speak:" + toString(change.subList(speakersSeq, Side.BEFORE)));
				System.out.println("timed:" + toString(change.subList(timingSeq, Side.AFTER)));
			}
		}
	}

	private static String toString(List<WordTime> words) {
		StringBuilder builder = new StringBuilder();
		for (WordTime word : words) {
			builder.append(' ');
			builder.append(word.lowercase);
		}
		return builder.toString();
	}
}
