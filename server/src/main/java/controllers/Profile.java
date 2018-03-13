/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.FOLLOW;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import auth.AuthUser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.NotFound;
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
		published, stars, followers, following, edit, drafts;

		public boolean requiresLogin() {
			return this == edit || this == drafts;
		}

		private String url(AccountRecord account) {
			if (this == published) {
				return "/" + account.getUsername();
			} else {
				return "/" + account.getUsername() + "?" + Routes.PROFILE_TAB + "=" + name();
			}
		}

		/** Renders the entire nav header, assuming that this Mode is active and the account is the given account. */
		public String render(AccountRecord account, boolean loggedIn) {
			StringBuilder builder = new StringBuilder();
			for (Mode mode : Mode.values()) {
				if (mode.requiresLogin() && !loggedIn) {
					continue;
				}
				builder.append("<li class=\"tab-nav__list-item\"><a href=\"");
				builder.append(mode.url(account));
				builder.append("\" class=\"tab-nav__link tab-nav__link--");
				builder.append(mode == this ? "active" : "inactive");
				builder.append("\">");
				builder.append(mode.name());
				builder.append("</a></li>");
			}
			return builder.toString();
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
					return NotFound.result();
				} else {
					// figure out if the user is logged-in
					int userId = account.getId();
					Optional<AuthUser> user = AuthUser.authOpt(req);
					boolean isLoggedIn = user.isPresent() && user.get().id() == userId;
					// and what tab they're opening
					Mutant tab = req.param(Routes.PROFILE_TAB);
					Mode mode = !tab.isSet() ? Mode.published : Mode.valueOf(tab.value());
					if (mode.requiresLogin() && !isLoggedIn) {
						return NotFound.result();
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
					case edit:
						return views.Profile.profileTodo.template(account, isLoggedIn, mode);
					case drafts:
						return Results.redirect(Routes.DRAFTS);
					default:
						throw new IllegalArgumentException("Unhandled tab mode");
					}
				}
			}
		});
		env.router().post(Routes.API_FOLLOW_ASK, req -> {
			AuthUser user = AuthUser.authOpt(req).orElse(null);
			FollowJson.FollowRes followRes = new FollowJson.FollowRes();
			if (user == null) {
				// User is not logged in, return false
				followRes.isFollowing = false;
				return followRes;
			}
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
			AuthUser user = AuthUser.authOpt(req).orElse(null);
			FollowJson.FollowRes followRes = new FollowJson.FollowRes();
			if (user == null) {
				// User is not logged in, return false
				followRes.isFollowing = false;
				return followRes;
			}
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
					followRecord.setFollowedAt(req.require(Time.class).nowTimestamp());
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
