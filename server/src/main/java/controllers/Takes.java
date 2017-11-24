/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.NotFound;
import common.Text;
import db.tables.records.TakepublishedRecord;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.internal.RoutePattern;
import org.jooq.DSLContext;
import org.jooq.Record;
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
				TakepublishedRecord take = dsl.selectFrom(TAKEPUBLISHED)
						// needs to be titleslug then userid for the postgres index to work
						.where(TAKEPUBLISHED.TITLE_SLUG.eq(title))
						.and(TAKEPUBLISHED.USER_ID.eq(dsl.select(ACCOUNT.ID)
								.from(ACCOUNT)
								.where(ACCOUNT.USERNAME.eq(user))))
						.fetchOne();
				if (take == null) {
					return NotFound.result();
				} else {
					return views.Takes.showTake.template(take);
				}
			}
		});
		env.router().get(USER.pattern(), req -> {
			String username = Text.lowercase(req, "user");
			try (DSLContext dsl = req.require(DSLContext.class)) {
				Record account = dsl.select(ACCOUNT.ID)
						.from(ACCOUNT)
						.where(ACCOUNT.USERNAME.eq(username))
						.fetchOne();
				if (account == null) {
					return NotFound.result();
				} else {
					int userId = account.get(ACCOUNT.ID);
					Result<?> takes = dsl
							.select(TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG, TAKEPUBLISHED.PUBLISHED_AT)
							.from(TAKEPUBLISHED)
							.where(TAKEPUBLISHED.USER_ID.eq(userId))
							.orderBy(TAKEPUBLISHED.PUBLISHED_AT.desc())
							.fetch();
					return views.Takes.listTakes.template(username, takes);
				}
			}
		});
	}
}
