/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.TAKEDRAFT;
import static db.Tables.TAKEREVISION;

import auth.AuthUser;
import com.google.common.base.Preconditions;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import db.tables.pojos.Takedraft;
import java.sql.Timestamp;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooq.DSLContext;
import org.jooq.Record3;
import org.jooq.Result;

public class Drafts implements Jooby.Module {
	/** special url for anonymous drafts */
	public static final String URL_NEW = "/new-take";
	public static final String URL = "/drafts";
	public static final String URL_SAVE = URL + "/save";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(URL_NEW, req -> {
			return views.Placeholder.newTake.template();
		});
		env.router().get(URL, req -> {
			AuthUser user = AuthUser.auth(req);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				Result<Record3<Integer, Timestamp, String>> drafts = dsl.select(TAKEDRAFT.ID, TAKEREVISION.CREATED_AT, TAKEREVISION.TITLE)
						.from(TAKEREVISION)
						.join(TAKEDRAFT)
						.on(TAKEDRAFT.LAST_REVISION.eq(TAKEREVISION.ID))
						.where(TAKEREVISION.ID.eq(user.id()))
						.fetch();
			}
			throw new UnsupportedOperationException("TODO");
		});
		env.router().post(URL_SAVE, req -> {
			AuthUser user = AuthUser.auth(req);

			int draftId = req.param(SAVE_draftid).intValue();
			int parentId = req.param(SAVE_parentid).intValue();
			String title = req.param(SAVE_title).value();
			String blocks = req.param(SAVE_blocks).value();

			try (DSLContext dsl = req.require(DSLContext.class)) {
				Takedraft draft = dsl.selectFrom(TAKEDRAFT)
						.where(TAKEDRAFT.ID.eq(draftId))
						.fetchOne().into(Takedraft.class);
				Preconditions.checkArgument(draft.getUserId().equals(user.id()));
				if (draft.getLastRevision().equals(parentId)) {
					// insert update
				} else {
					// insert new draft
				}
			}
			throw new UnsupportedOperationException("TODO");
		});
	}

	static final String SAVE_draftid = "draftid";
	static final String SAVE_parentid = "parentid";
	static final String SAVE_title = "title";
	static final String SAVE_blocks = "blocks";
}
