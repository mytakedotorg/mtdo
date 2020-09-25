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


import com.diffplug.common.base.Either;
import com.diffplug.common.base.Preconditions;
import com.diffplug.common.io.ByteSource;
import com.diffplug.common.io.Files;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java2ts.FT;
import javax.annotation.Nullable;
import org.eclipse.jgit.diff.Edit;
import org.eclipse.jgit.diff.MyersDiff;
import org.eclipse.jgit.diff.Sequence;
import org.eclipse.jgit.diff.SequenceComparator;
import org.mytake.factset.video.SaidTranscript.Turn;

public class TranscriptMatch {
	private final FT.VideoFactMeta meta;
	private final SaidTranscript said;
	private final VttTranscript vtt;

	private final List<Word.Said> saidWords;
	private final List<Word.Vtt> vttWords;

	private final List<Edit> editList;

	public TranscriptMatch(FT.VideoFactMeta meta, SaidTranscript said, VttTranscript vtt) {
		this(meta, said, vtt, vtt.words());
	}

	private TranscriptMatch(FT.VideoFactMeta meta, SaidTranscript said, VttTranscript vtt, List<Word.Vtt> vttWords) {
		this.meta = meta;
		this.said = said;
		this.vtt = vtt;

		this.saidWords = said.indexedWords();
		this.vttWords = vttWords;
		this.editList = edits(saidWords, vttWords);
	}

	static List<Edit> edits(List<? extends Word> a, List<? extends Word> b) {
		return MyersDiff.INSTANCE.diff(new WordTimeMatcher(), new ListSequence(a), new ListSequence(b));
	}

	public TranscriptMatch save(TranscriptFolder folder, String name, @Nullable List<Word.Vtt> newVtt, @Nullable String newSaid) throws IOException {
		SaidTranscript said;
		if (newSaid != null) {
			byte[] newSaidBytes = newSaid.getBytes();
			said = SaidTranscript.parse(meta, ByteSource.wrap(newSaidBytes));
			Files.asByteSink(folder.fileSaid(name)).write(newSaidBytes);
		} else {
			said = this.said;
		}
		VttTranscript vtt;
		if (newVtt != null) {
			vtt = this.vtt.save(newVtt, Files.asCharSink(folder.fileVtt(name), StandardCharsets.UTF_8));
		} else {
			vtt = this.vtt;
		}
		// because VttCtl uses `indexOf` on a vttWord, it needs vttWords to be the exact same
		// words that it already has internally.  Thus we take this little shortcut to avoid
		// creating new Word.Vtt instances - they'd have the same content anyway
		return new TranscriptMatch(meta, said, vtt, new ArrayList<>(newVtt));
	}

	public FT.VideoFactMeta meta() {
		return meta;
	}

	public SaidTranscript said() {
		return said;
	}

	public VttTranscript vtt() {
		return vtt;
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
	public VideoFactContentJava toVideoFact() {
		Preconditions.checkState(editList.isEmpty(), "The transcripts must match perfectly.");
		VideoFactContentJava java = new VideoFactContentJava();
		java.fact = meta.fact;
		java.youtubeId = meta.youtubeId;
		java.durationSeconds = meta.durationSeconds.doubleValue();
		java.speakers = meta.speakers;
		java.plainText = said.turns().stream().map(Turn::said).collect(Collectors.joining(" "));
		java.wordTime = vttWords.stream().mapToDouble(Word.Vtt::time).toArray();
		java.wordChar = new int[java.wordTime.length];
		java.wordChar[0] = 0;
		int startOffset = 0;
		int i = 0;
		outer: for (Turn turn : said.turns()) {
			List<Word.Said> words = turn.indexedWords(startOffset);
			for (Word.Said word : words) {
				java.wordChar[i] = word.startIdx();
				++i;
				if (i == java.wordChar.length) {
					break outer;
				}
			}
			startOffset += turn.said().length() + 1;
		}
		List<String> speakersByName = meta.speakers.stream().map(speaker -> speaker.fullName).collect(Collectors.toList());
		java.turnSpeaker = said.turns().stream().map(Turn::speaker).mapToInt(speakersByName::indexOf).toArray();
		java.turnWord = new int[said.turns().size()];
		java.turnWord[0] = 0;
		for (i = 1; i < said.turns().size(); ++i) {
			java.turnWord[i] = java.turnWord[i - 1] + said.turns().get(i - 1).indexedWords(0).size();
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
