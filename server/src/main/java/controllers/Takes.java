/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;

import com.google.gson.Gson;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.NotFound;
import common.Text;
import db.tables.pojos.Takepublished;
import db.tables.records.TakepublishedRecord;
import java.sql.Timestamp;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.internal.RoutePattern;
import org.jooq.DSLContext;
import org.jooq.Record2;
import org.jooq.Record4;
import org.jooq.Result;

public class Takes implements Jooby.Module {
	public static final RoutePattern USER_TITLE = new RoutePattern("GET", "/:user/:title");
	public static final RoutePattern USER = new RoutePattern("GET", "/:user");

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(USER_TITLE.pattern(), req -> {
			String user = Text.lowercase(req, "user");
			String title = Text.lowercase(req, "title");
			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakepublishedRecord record = dsl.selectFrom(TAKEPUBLISHED)
						.where(TAKEPUBLISHED.TITLE_SLUG.eq(title))
						.and(TAKEPUBLISHED.USER_ID.eq(dsl.select(ACCOUNT.ID)
								.from(ACCOUNT)
								.where(ACCOUNT.USERNAME.eq(user))))
						.fetchOne();
				if (record == null) {
					return NotFound.result();
				} else {
					// increment the view
					record.setCountView(record.getCountView() + 1);
					record.update();

					Takepublished take = record.into(Takepublished.class);
					String blocksJson = new Gson().toJson(take.getBlocks());
					return views.Takes.showTake.template(take, blocksJson);
				}
			}
		});
		env.router().get(USER.pattern(), req -> {
			String username = Text.lowercase(req, "user");
			try (DSLContext dsl = req.require(DSLContext.class)) {
				Record2<Integer, String> account = dsl.select(ACCOUNT.ID, ACCOUNT.NAME)
						.from(ACCOUNT)
						.where(ACCOUNT.USERNAME.eq(username))
						.fetchOne();
				if (account == null) {
					return NotFound.result();
				} else {
					int userId = account.component1();
					String name = account.component2(); // nullable
					Result<Record4<String, String, Timestamp, Integer>> takes = dsl
							.select(TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG, TAKEPUBLISHED.PUBLISHED_AT, TAKEPUBLISHED.COUNT_LIKE)
							.from(TAKEPUBLISHED)
							.where(TAKEPUBLISHED.USER_ID.eq(userId))
							.orderBy(TAKEPUBLISHED.PUBLISHED_AT.desc())
							.fetch();
					return takes;
				}
			}
		});
	}
}
