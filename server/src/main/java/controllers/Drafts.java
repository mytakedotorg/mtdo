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
import common.NotFound;
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
	public static final String URL = "/drafts";
	public static final String URL_NEW = URL + "/new";
	public static final String URL_SAVE = URL + "/save";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// brand new template
		env.router().get(URL_NEW, req -> {
			return views.Drafts.editTake.template(null, null, -1, -1);
		});
		// list drafts for the logged-in user
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
		// save a draft
		env.router().post(URL_SAVE, req -> {
			// the user has to be logged-in
			AuthUser user = AuthUser.auth(req);
			// if we're updating an existing draft, these will be set, but not for an initial save
			Mutant draftid = req.param(SAVE_draftid);
			Mutant lastrevid = req.param(SAVE_lastrevid);
			// the title and blocks must be set
			String title = req.param(SAVE_title).value();
			Preconditions.checkArgument(title.length() < VarChars.TITLE);
			String blocks = req.param(SAVE_blocks).value();

			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakedraftRecord draft;
				if (draftid.isSet()) {
					draft = dsl.selectFrom(TAKEDRAFT)
							.where(TAKEDRAFT.ID.eq(draftid.intValue()))
							.fetchOne();
					if (draft.getUserId().equals(user.id())) {
						return NotFound.result();
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
		// reopen an existing draft (MUST BE LAST so ":id" doesn't clobber other routes)
		env.router().get(URL + "/:id", req -> {
			AuthUser user = AuthUser.auth(req);
			int draftId = req.param("id").intValue();
			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakerevisionRecord rev = dsl.selectFrom(TAKEREVISION)
						.where(TAKEREVISION.ID.eq(
								dsl.select(TAKEDRAFT.LAST_REVISION)
										.where(TAKEDRAFT.ID.eq(draftId))
										.and(TAKEDRAFT.USER_ID.eq(user.id()))))
						.fetchOne();
				if (rev == null) {
					return "No such draft";
				} else {
					return views.Drafts.editTake.template(rev.getTitle(), rev.getBlocks(), draftId, rev.getId());
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
