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
import java.util.List;
import java.util.Objects;
import java2ts.Foundation;
import java2ts.Foundation.Speaker;
import java2ts.Search;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class LuceneTest {
	private static final String HASH = "HASH";

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
		fact.plainText = "Luke common Darth common several, green beans";
		fact.charOffsets = new int[]{0, 5, 12, 18, 25, 29, 34, 37};
		fact.timestamps = new double[]{0, 1, 2, 3, 4, 5, 6, 7};
		fact.speakerPerson = new int[]{0, 1};
		fact.speakerWord = new int[]{0, 2};

		try (Lucene lucene = new Lucene(writer -> {
			Lucene.writeVideo(writer, HASH, fact);
		})) {
			Lucene.NextRequest request = new Lucene.NextRequest();
			request.request = new Search.Request();
			request.request.q = "common";
			request.people = Collections.emptyList();

			// both people say common
			newQuery("common").expect(lucene, new VidResult(HASH, 0), new VidResult(HASH, 1));
			// this finds the one that only luke said
			newQuery("common").people("Luke Skywalker").expect(lucene, new VidResult(HASH, 0));
			newQuery("common").people("Darth Vader").expect(lucene, new VidResult(HASH, 1));

			// no people, but search a word that only they said
			newQuery("luke").expect(lucene, new VidResult(HASH, 0));
			newQuery("darth").expect(lucene, new VidResult(HASH, 1));

			// phrase search
			newQuery("luke common").expect(lucene, new VidResult(HASH, 0));
			newQuery("darth common").expect(lucene, new VidResult(HASH, 1));
			newQuery("Luke common").expect(lucene, new VidResult(HASH, 0));
			newQuery("Darth COMMON").expect(lucene, new VidResult(HASH, 1));

			newQuery("several beans").expect(lucene);
			newQuery("several green beans").expect(lucene, new VidResult(HASH, 1));
			newQuery("green beans").expect(lucene, new VidResult(HASH, 1));
			newQuery("several green").expect(lucene, new VidResult(HASH, 1));
		}
	}

	private QueryBuilder newQuery(String searchTerm) {
		return new QueryBuilder().searchTerm(searchTerm);
	}

	static class QueryBuilder {
		private String searchTerm;
		private List<String> people = Collections.emptyList();

		public QueryBuilder searchTerm(String searchTerm) {
			this.searchTerm = searchTerm;
			return this;
		}

		public QueryBuilder people(String... people) {
			this.people = Arrays.asList(people);
			return this;
		}

		public void expect(Lucene lucene, VidResult... results) throws IOException {
			Lucene.NextRequest request = new Lucene.NextRequest();
			request.request = new Search.Request();
			request.request.q = searchTerm;
			request.people = people;
			Assertions.assertThat(Lists.transform(lucene.searchDebate(request).facts, VidResult::new)).containsExactlyInAnyOrder(results);
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
