/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;

import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.internal.RoutePattern;
import org.jooq.DSLContext;

import com.google.gson.Gson;
import com.google.inject.Binder;
import com.typesafe.config.Config;

import common.RedirectException;
import common.Text;
import db.tables.pojos.Takepublished;
import db.tables.records.TakepublishedRecord;

public class Takes implements Jooby.Module {
	public static final RoutePattern USER_TITLE = new RoutePattern("GET", "/:user/:title");

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

				assertNotNull(record);
				// increment the view
				record.setCountView(record.getCountView() + 1);
				record.update();

				Takepublished take = record.into(Takepublished.class);
				String blocksJson = new Gson().toJson(take.getBlocks());
				return views.Takes.showTake.template(take, blocksJson);
			}
		});
	}

	static void assertNotNull(Object obj) {
		if (obj == null) {
			throw RedirectException.notFoundError("No such take.");
		}
	}
}
