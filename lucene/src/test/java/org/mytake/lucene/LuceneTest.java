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
 * You can contact us at team@mytake.org
 */
package org.mytake.lucene;

import com.diffplug.common.collect.Lists;
import compat.java2ts.VideoFactContentJava;
import java.io.IOException;
import java.util.Arrays;
import java.util.Objects;
import java2ts.FT;
import java2ts.FT.Speaker;
import java2ts.Search;
import org.assertj.core.api.Assertions;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

public class LuceneTest {
	private static final String HASH = "HASH";

	@Rule
	public TemporaryFolder tempFolder = new TemporaryFolder();

	@Test
	public void broadTest() throws IOException {
		Speaker luke = new Speaker();
		luke.fullName = "Luke Skywalker";
		luke.role = "candidate";
		Speaker darth = new Speaker();
		darth.fullName = "Darth Vader";
		darth.role = "candidate";

		VideoFactContentJava fact = new VideoFactContentJava();
		fact.fact = new FT.Fact();
		fact.fact.kind = FT.KIND_VIDEO;
		fact.fact.primaryDate = "2010-11-12";
		fact.fact.primaryDateKind = "recorded";
		fact.fact.title = "Title";
		fact.youtubeId = "youtube";
		fact.durationSeconds = 123;
		fact.speakers = Arrays.asList(luke, darth);
		fact.plainText = "Luke common Darth common several, green beans";
		fact.wordChar = new int[]{0, 5, 12, 18, 25, 29, 34, 37};
		fact.timestamps = new double[]{0, 1, 2, 3, 4, 5, 6, 7};
		fact.turnSpeaker = new int[]{0, 1};
		fact.turnWord = new int[]{0, 2};

		try (Lucene.Writer writer = new Lucene.Writer(tempFolder.getRoot().toPath())) {
			writer.writeVideo(HASH, fact);
		}

		try (Lucene lucene = new Lucene(tempFolder.getRoot().toPath())) {
			// both people say common
			newQuery("common").expect(lucene, new VidResult(HASH, 0), new VidResult(HASH, 1));

			// no people, but search a word that only they said
			newQuery("luke").expect(lucene, new VidResult(HASH, 0));
			newQuery("darth").expect(lucene, new VidResult(HASH, 1));

			// phrase search
			newQuery("luke common").expect(lucene, new VidResult(HASH, 0));
			newQuery("darth common").expect(lucene, new VidResult(HASH, 1));
			newQuery("Luke common").expect(lucene, new VidResult(HASH, 0));
			newQuery("Darth COMMON").expect(lucene, new VidResult(HASH, 1));

			// phrase ignores punctuation in source
			newQuery("several beans").expect(lucene);
			newQuery("several green beans").expect(lucene, new VidResult(HASH, 1));
			newQuery("green beans").expect(lucene, new VidResult(HASH, 1));
			newQuery("several green").expect(lucene, new VidResult(HASH, 1));

			// multiclause
			newQuery("luke common, darth common").expect(lucene, new VidResult(HASH, 0), new VidResult(HASH, 1));
		}
	}

	private QueryBuilder newQuery(String searchTerm) {
		return new QueryBuilder().searchTerm(searchTerm);
	}

	static class QueryBuilder {
		private String searchTerm;

		public QueryBuilder searchTerm(String searchTerm) {
			this.searchTerm = searchTerm;
			return this;
		}

		public void expect(Lucene lucene, VidResult... results) throws IOException {
			Lucene.NextRequest request = new Lucene.NextRequest(searchTerm);
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
