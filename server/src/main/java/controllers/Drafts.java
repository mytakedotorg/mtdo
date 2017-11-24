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
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.NotFound;
import common.Time;
import db.tables.records.TakedraftRecord;
import db.tables.records.TakerevisionRecord;
import java2ts.DraftPost;
import java2ts.DraftRev;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooq.DSLContext;
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
				Result<?> drafts = dsl.select(TAKEDRAFT.ID, TAKEREVISION.CREATED_AT, TAKEREVISION.TITLE)
						.from(TAKEREVISION)
						.join(TAKEDRAFT).on(TAKEDRAFT.LAST_REVISION.eq(TAKEREVISION.ID))
						.where(TAKEDRAFT.USER_ID.eq(user.id()))
						.orderBy(TAKEREVISION.CREATED_AT.desc())
						.fetch();
				return views.Drafts.listDrafts.template(drafts);
			}
		});
		// save a draft
		env.router().post(URL_SAVE, req -> {
			// the user has to be logged-in
			AuthUser user = AuthUser.auth(req);
			// if we're updating an existing draft, these will be set, but not for an initial save
			DraftPost post = req.body(DraftPost.class);

			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakedraftRecord draft;
				if (post.parentRev != null) {
					draft = dsl.selectFrom(TAKEDRAFT)
							.where(TAKEDRAFT.ID.eq(post.parentRev.draftid))
							.and(TAKEDRAFT.USER_ID.eq(user.id()))
							.fetchOne();
					if (draft == null) {
						return NotFound.result();
					}
				} else {
					draft = null;
				}

				TakerevisionRecord rev = dsl.newRecord(TAKEREVISION);
				rev.setTitle(post.title);
				rev.setBlocks(post.blocks.toString());
				rev.setCreatedAt(req.require(Time.class).nowTimestamp());
				rev.setCreatedIp(req.ip());

				if (draft != null && draft.getLastRevision().equals((int) post.parentRev.lastrevid)) {
					// update an existing draft
					rev.setParentId(draft.getLastRevision());
					rev.insert();
					draft.setLastRevision(rev.getId());
					draft.update();
					return postResponse(draft);
				} else {
					// insert a new draft
					rev.insert();
					TakedraftRecord newdraft = dsl.newRecord(TAKEDRAFT);
					newdraft.setUserId(user.id());
					newdraft.setLastRevision(rev.getId());
					newdraft.insert();
					return postResponse(newdraft);
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
										.from(TAKEDRAFT)
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

	private static DraftRev postResponse(TakedraftRecord draft) {
		DraftRev response = new DraftRev();
		response.draftid = draft.getId();
		response.lastrevid = draft.getLastRevision();
		return response;
	}

	public static String urlEdit(int draftId) {
		return URL + "/" + draftId;
	}
}
