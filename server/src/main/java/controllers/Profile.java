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
import static db.Tables.FOLLOW;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import auth.AuthUser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.RedirectException;
import common.Text;
import common.Time;
import db.enums.Reaction;
import db.tables.records.AccountRecord;
import db.tables.records.FollowRecord;
import java.util.Optional;
import java2ts.FollowJson;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Mutant;
import org.jooby.Results;
import org.jooby.internal.RoutePattern;
import org.jooq.DSLContext;
import org.jooq.Result;

/** Handles the user's profile. */
public class Profile implements Jooby.Module {
	/** Represents a single mode in the profile page. */
	public enum Mode {
		/** The definition order represents the order the tabs will appear in the UI */
		profile, bookmarks, published, stars, followers, following, drafts;

		public boolean isHidden() {
			return this == published || this == stars || this == drafts;
		}

		public boolean requiresLogin() {
			return this == profile || this == drafts;
		}

		public String url(AccountRecord account) {
			if (this == published) {
				return "/" + account.getUsername();
			} else {
				return "/" + account.getUsername() + "?" + Routes.PROFILE_TAB + "=" + name();
			}
		}
	}

	private static final RoutePattern USER = new RoutePattern("GET", "/:user");

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(USER.pattern(), req -> {
			String username = Text.lowercase(req, "user");
			try (DSLContext dsl = req.require(DSLContext.class)) {
				AccountRecord account = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.USERNAME.eq(username))
						.fetchOne();
				if (account == null) {
					throw RedirectException.notFoundError("Unknown user " + username);
				}
				// figure out if the user is logged-in
				int userId = account.getId();
				Optional<AuthUser> user = AuthUser.authOpt(req);
				boolean isLoggedIn = user.isPresent() && user.get().id() == userId;
				// and what tab they're opening
				Mutant tab = req.param(Routes.PROFILE_TAB);
				Mode mode = !tab.isSet() ? Mode.bookmarks : Mode.valueOf(tab.value());
				if (mode.requiresLogin() && !isLoggedIn) {
					throw RedirectException.notFoundError();
				}
				// then find the right record and render it
				switch (mode) {
				case published:
					Result<?> published = dsl
							.select(TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG, TAKEPUBLISHED.PUBLISHED_AT)
							.from(TAKEPUBLISHED)
							.where(TAKEPUBLISHED.USER_ID.eq(userId))
							.orderBy(TAKEPUBLISHED.PUBLISHED_AT.desc(), TAKEPUBLISHED.TITLE_SLUG.asc())
							.fetch();
					return views.Profile.profilePublished.template(account, isLoggedIn, published);
				case stars:
					Result<?> likes = dsl.select(TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG, TAKEREACTION.REACTED_AT, ACCOUNT.USERNAME)
							.from(TAKEPUBLISHED)
							.innerJoin(TAKEREACTION)
							.on(TAKEPUBLISHED.ID.eq(TAKEREACTION.TAKE_ID))
							.innerJoin(ACCOUNT)
							.on(TAKEPUBLISHED.USER_ID.eq(ACCOUNT.ID))
							.where(TAKEREACTION.USER_ID.eq(userId).and(TAKEREACTION.KIND.eq(Reaction.like)))
							.orderBy(TAKEREACTION.REACTED_AT.desc(), TAKEPUBLISHED.TITLE_SLUG.asc())
							.fetch();
					return views.Profile.profileStars.template(account, isLoggedIn, likes);
				case followers:
					Result<?> followers = dsl
							.select(FOLLOW.AUTHOR, FOLLOW.FOLLOWER, FOLLOW.FOLLOWED_AT, ACCOUNT.USERNAME)
							.from(ACCOUNT)
							.innerJoin(FOLLOW)
							.on(ACCOUNT.ID.eq(FOLLOW.FOLLOWER))
							.where(FOLLOW.AUTHOR.eq(userId))
							.orderBy(FOLLOW.FOLLOWED_AT.desc())
							.fetch();
					return views.Profile.profileFollowers.template(account, isLoggedIn, followers);
				case following:
					Result<?> following = dsl
							.select(FOLLOW.AUTHOR, FOLLOW.FOLLOWER, FOLLOW.FOLLOWED_AT, ACCOUNT.USERNAME)
							.from(ACCOUNT)
							.innerJoin(FOLLOW)
							.on(ACCOUNT.ID.eq(FOLLOW.AUTHOR))
							.where(FOLLOW.FOLLOWER.eq(userId))
							.orderBy(FOLLOW.FOLLOWED_AT.desc())
							.fetch();
					return views.Profile.profileFollowing.template(account, isLoggedIn, following);
				case profile:
					return views.Profile.profileTodo.template(account, isLoggedIn, mode);
				case drafts:
					return Results.redirect(Routes.DRAFTS);
				case bookmarks:
					return views.Profile.profileBookmarks.template(account, isLoggedIn);
				default:
					throw new IllegalArgumentException("Unhandled tab mode");
				}
			}
		});
		env.router().post(Routes.API_FOLLOW_ASK, req -> {
			AuthUser user = AuthUser.auth(req);
			FollowJson.FollowRes followRes = new FollowJson.FollowRes();
			FollowJson.FollowAskReq followReq = req.body(FollowJson.FollowAskReq.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				// Return true if the record exists, false otherwise
				followRes.isFollowing = dsl.fetchExists(
						dsl.select(FOLLOW.AUTHOR, FOLLOW.FOLLOWER)
								.from(FOLLOW)
								.innerJoin(ACCOUNT)
								.on(ACCOUNT.USERNAME.eq(followReq.username))
								.where(FOLLOW.AUTHOR.eq(ACCOUNT.ID))
								.and(FOLLOW.FOLLOWER.eq(user.id())));
				return followRes;
			}
		});
		env.router().post(Routes.API_FOLLOW_TELL, req -> {
			AuthUser user = AuthUser.auth(req);
			FollowJson.FollowRes followRes = new FollowJson.FollowRes();
			FollowJson.FollowTellReq followReq = req.body(FollowJson.FollowTellReq.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				int authorId = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.USERNAME.eq(followReq.username))
						.fetchOne(ACCOUNT.ID);
				if (followReq.isFollowing) {
					// User wants to follow author
					FollowRecord followRecord = dsl.newRecord(FOLLOW);
					followRecord.setAuthor(authorId);
					followRecord.setFollower(user.id());
					followRecord.setFollowedAt(req.require(Time.class).now());
					followRecord.insert();
					followRes.isFollowing = true;
				} else {
					// Delete the record
					dsl.deleteFrom(FOLLOW)
							.where(FOLLOW.AUTHOR.eq(authorId))
							.and(FOLLOW.FOLLOWER.eq(user.id()))
							.execute();
					followRes.isFollowing = false;
				}
				return followRes;
			}
		});
	}
}
