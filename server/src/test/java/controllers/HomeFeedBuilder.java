/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;

import com.jsoniter.JsonIterator;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import common.JoobyDevRule;
import db.tables.records.TakepublishedRecord;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java2ts.Card;
import org.jooq.DSLContext;

public class HomeFeedBuilder {
	public static void main(String[] args) throws Throwable {
		JoobyDevRule dev = JoobyDevRule.initialData();
		dev.before();
		System.out.println("@@@@@@@@@@@@@@@@@@@@@\n" +
				new Builder(dev.dsl())
						.add("samples", "why-its-so-hard-to-have-peace", 1, 2) // paragraph, evidence
						.add("samples", "does-a-law-mean-what-it-says-or-what-it-meant", 6, 11) // evidence, paragraph
						.add("samples", "dont-worry-well-protect-the-constitution-for-you", 1, 0) // evidence, paragraph
						.asString()
				+
				"\n@@@@@@@@@@@@@@@@@@@@@");
		dev.after();
	}

	static class Builder {
		final DSLContext dsl;
		final List<Card> cards = new ArrayList<>();

		Builder(DSLContext dsl) {
			this.dsl = dsl;
		}

		Builder add(String username, String titleSlug, int previewBlock1, int previewBlock2) throws IOException {
			Card card = new Card();
			card.username = username;
			card.titleSlug = titleSlug;

			int userId = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.USERNAME.eq(username))
					.fetchOne(ACCOUNT.ID);
			TakepublishedRecord published = dsl.selectFrom(TAKEPUBLISHED)
					.where(TAKEPUBLISHED.TITLE_SLUG.eq(titleSlug).and(TAKEPUBLISHED.USER_ID.eq(userId)))
					.fetchOne();
			card.title = published.getTitle();
			card.previewBlocks = new int[]{previewBlock1, previewBlock2};
			card.blocks = JsonIterator.parse(published.getBlocks().data()).readAny();
			cards.add(card);
			return this;
		}

		String asString() {
			JsonStream.setMode(EncodingMode.REFLECTION_MODE);
			return JsonStream.serialize(cards);
		}
	}
}
