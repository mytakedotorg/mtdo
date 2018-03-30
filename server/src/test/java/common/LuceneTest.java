/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.google.common.collect.Lists;
import compat.java2ts.VideoFactContentJava;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Objects;
import java2ts.Foundation;
import java2ts.Foundation.Speaker;
import java2ts.Search;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class LuceneTest {
	@Test
	public void test() throws IOException {
		Speaker luke = new Speaker();
		luke.fullName = "Luke Skywalker";
		luke.role = "candidate";
		Speaker darth = new Speaker();
		darth.fullName = "Darth Vader";
		darth.role = "candidate";

		VideoFactContentJava fact = new VideoFactContentJava();
		fact.fact = new Foundation.Fact();
		fact.fact.kind = Foundation.KIND_VIDEO;
		fact.fact.primaryDate = "2010-11-12";
		fact.fact.primaryDateKind = "recorded";
		fact.fact.title = "Title";
		fact.youtubeId = "youtube";
		fact.durationSeconds = 123;
		fact.speakers = Arrays.asList(luke, darth);
		fact.plainText = "Luke common Darth common";
		fact.charOffsets = new int[]{0, 5, 12, 18};
		fact.timestamps = new double[]{0, 1, 2, 3};
		fact.speakerPerson = new int[]{0, 1};
		fact.speakerWord = new int[]{0, 2};

		try (Lucene lucene = new Lucene(writer -> {
			Lucene.writeVideo(writer, "TODO", fact);
		})) {

			Lucene.NextRequest request = new Lucene.NextRequest();
			request.request = new Search.Request();
			request.request.searchTerm = "common";
			request.people = Collections.emptyList();

			// both people say common
			Assertions.assertThat(Lists.transform(lucene.searchDebate(request).facts, VidResult::new)).containsExactlyInAnyOrder(
					new VidResult("youtube", 0),
					new VidResult("youtube", 1));
			// this finds the one that only luke said
			request.people = Arrays.asList("Luke null Skywalker");
			Assertions.assertThat(Lists.transform(lucene.searchDebate(request).facts, VidResult::new)).containsExactlyInAnyOrder(
					new VidResult("youtube", 0));
			// and this one only darth said
			request.people = Arrays.asList("Darth null Vader");
			Assertions.assertThat(Lists.transform(lucene.searchDebate(request).facts, VidResult::new)).containsExactlyInAnyOrder(
					new VidResult("youtube", 1));

			// no people, but search a word that only luke said
			request.people = Collections.emptyList();
			request.request.searchTerm = "luke";
			Assertions.assertThat(Lists.transform(lucene.searchDebate(request).facts, VidResult::new)).containsExactlyInAnyOrder(
					new VidResult("youtube", 0));
			// and a word that only darth said
			request.request.searchTerm = "darth";
			Assertions.assertThat(Lists.transform(lucene.searchDebate(request).facts, VidResult::new)).containsExactlyInAnyOrder(
					new VidResult("youtube", 1));
		}
	}

	static class VidResult extends Search.VideoResult {
		VidResult(String hash, int turn) {
			this.hash = hash;
			this.turn = turn;
		}

		VidResult(Search.VideoResult init) {
			this(init.hash, init.turn);
		}

		@Override
		public boolean equals(Object other) {
			if (other instanceof Search.VideoResult) {
				Search.VideoResult o = (Search.VideoResult) other;
				return o.hash.equals(hash) && o.turn == turn;
			} else {
				return false;
			}
		}

		@Override
		public int hashCode() {
			return Objects.hash(hash, turn);
		}

		@Override
		public String toString() {
			return "{" + hash + " " + turn + "}";
		}
	}
}
