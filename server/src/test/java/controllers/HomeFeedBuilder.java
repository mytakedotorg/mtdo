/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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
			card.blocks = JsonIterator.parse(published.getBlocks()).readAny();
			cards.add(card);
			return this;
		}

		String asString() {
			JsonStream.setMode(EncodingMode.REFLECTION_MODE);
			return JsonStream.serialize(cards);
		}
	}
}
