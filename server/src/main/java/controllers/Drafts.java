/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.TAKEDRAFT;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREVISION;

import auth.AuthUser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.IpGetter;
import common.Mods;
import common.NotFound;
import common.Text;
import common.Time;
import db.tables.records.TakedraftRecord;
import db.tables.records.TakepublishedRecord;
import db.tables.records.TakerevisionRecord;
import java2ts.DraftPost;
import java2ts.DraftRev;
import java2ts.PublishResult;
import java2ts.Routes;
import javax.annotation.Nullable;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Status;
import org.jooq.DSLContext;
import org.jooq.Result;

public class Drafts implements Jooby.Module {
	/** Returns the existing draft, if present, for the given draft post. */
	@Nullable
	private TakedraftRecord draft(DSLContext dsl, AuthUser user, @Nullable DraftRev parentRev) {
		if (parentRev == null) {
			return null;
		} else {
			TakedraftRecord draft = dsl.selectFrom(TAKEDRAFT)
					.where(TAKEDRAFT.ID.eq(parentRev.draftid))
					.and(TAKEDRAFT.USER_ID.eq(user.id()))
					.fetchOne();
			if (draft == null) {
				throw NotFound.exception();
			} else {
				return draft;
			}
		}
	}

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// brand new template
		env.router().get(Routes.DRAFTS_NEW, req -> {
			return views.Drafts.editTake.template(null, null, -1, -1);
		});
		// list drafts for the logged-in user
		env.router().get(Routes.DRAFTS, req -> {
			AuthUser user = AuthUser.auth(req);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				// draftid, timestamp, title
				Result<?> drafts = dsl.select(TAKEDRAFT.ID, TAKEREVISION.CREATED_AT, TAKEREVISION.TITLE)
						.from(TAKEREVISION)
						.join(TAKEDRAFT).on(TAKEDRAFT.LAST_REVISION.eq(TAKEREVISION.ID))
						.where(TAKEDRAFT.USER_ID.eq(user.id()))
						.orderBy(TAKEREVISION.CREATED_AT.desc(), TAKEDRAFT.ID.asc())
						.fetch();
				return views.Drafts.listDrafts.template(drafts);
			}
		});
		env.router().post(Routes.DRAFTS_DELETE, req -> {
			AuthUser user = AuthUser.auth(req);
			DraftRev rev = req.body(DraftRev.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakedraftRecord draft = draft(dsl, user, rev);
				if (draft.getLastRevision().intValue() == rev.lastrevid) {
					deleteDraft(dsl, draft);
					return Status.OK;
				} else {
					return NotFound.result();
				}
			}
		});
		env.router().post(Routes.DRAFTS_SAVE, req -> {
			AuthUser user = AuthUser.auth(req);
			DraftPost post = req.body(DraftPost.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakedraftRecord draft = draft(dsl, user, post.parentRev);

				TakerevisionRecord rev = dsl.newRecord(TAKEREVISION);
				rev.setTitle(post.title);
				rev.setBlocks(post.blocks.toString());
				rev.setCreatedAt(req.require(Time.class).nowTimestamp());
				rev.setCreatedIp(req.require(IpGetter.class).ip(req));

				if (draft != null && draft.getLastRevision().intValue() == post.parentRev.lastrevid) {
					// update an existing draft
					rev.setParentId(draft.getLastRevision());
					rev.insert();
					draft.setLastRevision(rev.getId());
					draft.update();
					return postResponse(draft);
				} else {
					// insert a new draft, perhaps because of a conflict
					// if there was a conflict, we can't maintain history
					// because we would have problems when those revs are deleted
					// when the article gets published
					rev.insert();
					TakedraftRecord newdraft = dsl.newRecord(TAKEDRAFT);
					newdraft.setUserId(user.id());
					newdraft.setLastRevision(rev.getId());
					newdraft.insert();
					return postResponse(newdraft);
				}
			}
		});
		env.router().post(Routes.DRAFTS_PUBLISH, req -> {
			// the user has to be logged-in
			AuthUser user = AuthUser.auth(req);
			DraftPost post = req.body(DraftPost.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				String titleSlug = Text.slugify(post.title);
				int numAlreadyPublished = dsl.fetchCount(dsl.selectFrom(TAKEPUBLISHED)
						// needs to be titleslug then userid for the postgres index to work
						.where(TAKEPUBLISHED.TITLE_SLUG.eq(titleSlug))
						.and(TAKEPUBLISHED.USER_ID.eq(user.id())));

				PublishResult result = new PublishResult();
				result.publishedUrl = Takes.userTitleSlug(user.username(), titleSlug);
				if (numAlreadyPublished > 0) {
					result.conflict = true;
					return result;
				} else {
					result.conflict = false;
				}

				TakedraftRecord draft = draft(dsl, user, post.parentRev);
				if (draft != null) {
					deleteDraft(dsl, draft);
				}

				// create a published take
				TakepublishedRecord published = dsl.newRecord(TAKEPUBLISHED);
				published.setUserId(user.id());
				published.setTitle(post.title);
				published.setTitleSlug(titleSlug);
				published.setBlocks(post.blocks.toString());
				published.setPublishedAt(req.require(Time.class).nowTimestamp());
				published.setPublishedIp(req.require(IpGetter.class).ip(req));
				published.insert();

				req.require(Mods.class).send(email -> email
						.setSubject("New take '" + post.title + "' by " + user.username())
						.setMsg(Mods.table(
								"Username", user.username(),
								"User id", Integer.toString(user.id()),
								"Title", post.title,
								"Take id", published.getId().toString(),
								"Link", "https://mytake.org/" + user.username() + "/" + titleSlug)));
				return result;
			}
		});
		// reopen an existing draft (MUST BE LAST so ":id" doesn't clobber other routes)
		env.router().get(Routes.DRAFTS + "/:id", req -> {
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
					return NotFound.result();
				} else {
					return views.Drafts.editTake.template(rev.getTitle(), rev.getBlocks(), draftId, rev.getId());
				}
			}
		});
	}

	private static void deleteDraft(DSLContext dsl, TakedraftRecord draft) {
		// delete the draft
		draft.delete();
		// and all of its revs
		Integer parentId = draft.getLastRevision();
		while (parentId != null) {
			parentId = dsl.deleteFrom(TAKEREVISION)
					.where(TAKEREVISION.ID.eq(parentId))
					.returning(TAKEREVISION.PARENT_ID)
					.fetchOne()
					.getParentId();
		}
	}

	private static DraftRev postResponse(TakedraftRecord draft) {
		DraftRev response = new DraftRev();
		response.draftid = draft.getId();
		response.lastrevid = draft.getLastRevision();
		return response;
	}

	public static String urlEdit(int draftId) {
		return Routes.DRAFTS + "/" + draftId;
	}
}
