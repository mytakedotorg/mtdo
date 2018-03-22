/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Either;
import com.diffplug.common.base.Preconditions;
import com.diffplug.common.collect.Lists;
import compat.java2ts.VideoFactContentJava;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import org.eclipse.jgit.diff.Edit;
import org.eclipse.jgit.diff.MyersDiff;
import org.eclipse.jgit.diff.Sequence;
import org.eclipse.jgit.diff.SequenceComparator;
import org.mytake.foundation.transcript.SaidTranscript.Turn;

public class WordMatch {
	private SaidTranscript said;
	private VttTranscript vtt;

	private final List<Word.Said> saidWords;
	private final List<Word.Vtt> vttWords;

	private final List<Edit> editList;

	public WordMatch(Recording recording) throws IOException {
		this(SaidTranscript.parse(recording.getSaidFile()),
				VttTranscript.parse(recording.getVttFile()));
	}

	public WordMatch(SaidTranscript said, VttTranscript vtt) {
		this.said = said;
		this.vtt = vtt;

		this.saidWords = said.attributedWords();
		this.vttWords = vtt.words();
		this.editList = MyersDiff.INSTANCE.diff(new WordTimeMatcher(), new ListSequence(saidWords), new ListSequence(vttWords));
	}

	public List<Word.Said> saidWords() {
		return saidWords;
	}

	public List<Word.Vtt> vttWords() {
		return vttWords;
	}

	public List<Edit> edits() {
		return editList;
	}

	public Either<List<Word.Said>, Integer> saidFor(Edit edit) {
		if (edit.getBeginA() == edit.getEndA()) {
			return Either.createRight(edit.getBeginA());
		} else {
			return Either.createLeft(saidWords.subList(edit.getBeginA(), edit.getEndA()));
		}
	}

	public Either<List<Word.Vtt>, Integer> vttFor(Edit edit) {
		if (edit.getBeginB() == edit.getEndB()) {
			return Either.createRight(edit.getBeginB());
		} else {
			return Either.createLeft(vttWords.subList(edit.getBeginB(), edit.getEndB()));
		}
	}

	/**
	 * YOU CAN ONLY CALL THIS IF {@link #edits()} IS EMPTY!
	 * 
	 * But if it is empty, then this will create a VideoFactContentJava
	 * with all the appropriate content.
	 */
	public VideoFactContentJava toVideoFact(Recording recording) {
		Preconditions.checkState(editList.isEmpty(), "The transcripts must match perfectly.");
		VideoFactContentJava java = new VideoFactContentJava();
		java.youtubeId = recording.youtubeId();
		java.durationSecs = recording.durationSec();
		List<Speaker> speakers = said.toSpeakers();
		java.speakers = Lists.transform(speakers, Speaker::toPerson);
		java.plainText = said.turns().stream().map(Turn::said).collect(Collectors.joining(" "));
		java.timestamps = vttWords.stream().mapToDouble(Word.Vtt::time).toArray();
		java.charOffsets = new int[java.timestamps.length];
		java.charOffsets[0] = 0;
		int i = 1;
		for (Turn turn : said.turns()) {
			for (String word : turn.words()) {
				if (i == java.charOffsets.length) {
					break;
				}
				java.charOffsets[i] = java.charOffsets[i - 1] + word.length() + 1;
				++i;
			}
		}
		java.speakerPerson = said.turns().stream().map(Turn::speaker).mapToInt(speakers::indexOf).toArray();
		java.speakerWord = new int[said.turns().size()];
		java.speakerWord[0] = 0;
		for (i = 1; i < said.turns().size(); ++i) {
			java.speakerWord[i] = java.speakerWord[i - 1] + said.turns().get(i).said().length() + 1;
		}
		return java;
	}

	///////////////////
	// JGit adapters //
	///////////////////
	private static class ListSequence extends Sequence {
		private final List<? extends Word> list;

		public ListSequence(List<? extends Word> list) {
			this.list = list;
		}

		@Override
		public int size() {
			return list.size();
		}
	}

	private static class WordTimeMatcher extends SequenceComparator<ListSequence> {
		@Override
		public boolean equals(ListSequence a, int ai, ListSequence b, int bi) {
			return a.list.get(ai).lowercase.equals(b.list.get(bi).lowercase);
		}

		@Override
		public int hash(ListSequence seq, int ptr) {
			return seq.list.get(ptr).lowercase.hashCode();
		}
	}
}
