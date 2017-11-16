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
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.RedirectException;
import common.SimpleJson;
import common.Time;
import db.VarChars;
import db.tables.records.TakedraftRecord;
import db.tables.records.TakerevisionRecord;
import java.sql.Timestamp;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Mutant;
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
				// draftid, timestamp, title
				Result<Record3<Integer, Timestamp, String>> drafts = dsl.select(TAKEDRAFT.ID, TAKEREVISION.CREATED_AT, TAKEREVISION.TITLE)
						.from(TAKEREVISION)
						.join(TAKEDRAFT).on(TAKEDRAFT.LAST_REVISION.eq(TAKEREVISION.ID))
						.where(TAKEDRAFT.USER_ID.eq(user.id()))
						.orderBy(TAKEREVISION.CREATED_AT.desc())
						.fetch();
				return drafts;
			}
		});
		env.router().post(URL_SAVE, req -> {
			// the user has to be logged-in
			AuthUser user = AuthUser.auth(req);
			// if we're updating an existing draft, these will be set, but not for an initial save
			Mutant draftid = req.param(SAVE_draftid);
			Mutant lastrevid = req.param(SAVE_lastrevid);
			// the title and blocks must be set
			String title = req.param(SAVE_title).value();
			Preconditions.checkArgument(title.length() < VarChars.TITLE);
			JsonElement blocks = new JsonParser().parse(req.param(SAVE_blocks).value());

			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakedraftRecord draft;
				if (draftid.isSet()) {
					draft = dsl.selectFrom(TAKEDRAFT)
							.where(TAKEDRAFT.ID.eq(draftid.intValue()))
							.fetchOne();
					if (draft.getUserId().equals(user.id())) {
						throw RedirectException.badRequestError("This isn't your draft");
					}
				} else {
					draft = null;
				}

				TakerevisionRecord rev = dsl.newRecord(TAKEREVISION);
				rev.setTitle(title);
				rev.setBlocks(blocks);
				rev.setCreatedAt(req.require(Time.class).nowTimestamp());
				rev.setCreatedIp(req.ip());

				if (draft != null && draft.getLastRevision().equals(lastrevid.intValue())) {
					// update an existing draft
					rev.setParentId(draft.getLastRevision());
					rev.insert();
					draft.setLastRevision(rev.getId());
					draft.update();
					return draftLastrev(draft);
				} else {
					// insert a new draft
					rev.insert();
					TakedraftRecord newdraft = dsl.newRecord(TAKEDRAFT);
					newdraft.setUserId(user.id());
					newdraft.setLastRevision(rev.getId());
					newdraft.insert();
					return draftLastrev(draft);
				}
			}
		});
	}

	private static Object draftLastrev(TakedraftRecord draft) {
		return SimpleJson.unescaped(SAVE_draftid, draft.getId().toString(),
				SAVE_lastrevid, draft.getLastRevision().toString());
	}

	static final String SAVE_draftid = "draftid";
	static final String SAVE_lastrevid = "lastrevid";
	static final String SAVE_title = "title";
	static final String SAVE_blocks = "blocks";
}
