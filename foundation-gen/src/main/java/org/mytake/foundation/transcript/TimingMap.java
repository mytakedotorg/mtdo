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

	private final List<WordTime> speakersSeq, timingSeq;
	private final int numIdentical, numSpeakerOnly, numVttOnly;
	private final int groups;

	private TimingMap(SpeakersTranscript speakers, VttTranscript timing) {
		this.speakersSeq = speakers.words();
		this.timingSeq = timing.words();

		int numIdentical = 0;
		int numSpeakerOnly = 0;
		int numVttOnly = 0;
		int groups = 0;
		List<ListChange> changes = JGitListDiffer.myersDiff().diffOn(speakersSeq, timingSeq, word -> word.lowercase);
		for (ListChange change : changes) {
			if (change.getType().isIdentical()) {
				numIdentical += change.getAfterLength();
				List<WordTime> words = change.subList(speakersSeq, Side.BEFORE);
				System.out.println("EQUAL:" + toString(words));
			} else {
				numSpeakerOnly += change.getBeforeLength();
				numVttOnly += change.getAfterLength();
				++groups;
				System.out.println("speak:" + toString(change.subList(speakersSeq, Side.BEFORE)));
				System.out.println("timed:" + toString(change.subList(timingSeq, Side.AFTER)));
			}
		}
		this.numIdentical = numIdentical;
		this.numSpeakerOnly = numSpeakerOnly;
		this.numVttOnly = numVttOnly;
		this.groups = groups;

		System.out.println("numIdentical=" + numIdentical);
		System.out.println("numSpeakerOnly=" + numSpeakerOnly);
		System.out.println("numVttOnly=" + numVttOnly);
		System.out.println("groups=" + groups);
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
