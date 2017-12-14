/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import auth.AuthUser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.NotFound;
import common.Text;
import db.enums.Reaction;
import db.tables.records.AccountRecord;
import java.util.Optional;
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
		published, likes, followers, following, edit, drafts;

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
				builder.append("<a href=\"");
				builder.append(mode.url(account));
				builder.append("\" class=\"");
				builder.append(mode == this ? "active" : "inactive");
				builder.append("\">");
				builder.append(mode.name());
				builder.append("</a>");
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
					case likes:
						Result<?> likes = dsl.select(TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG, TAKEREACTION.REACTED_AT)
								.from(TAKEPUBLISHED)
								.innerJoin(TAKEREACTION)
								.on(TAKEPUBLISHED.ID.eq(TAKEREACTION.TAKE_ID))
								.where(TAKEREACTION.USER_ID.eq(userId).and(TAKEREACTION.KIND.eq(Reaction.like)))
								.orderBy(TAKEREACTION.REACTED_AT.desc(), TAKEPUBLISHED.TITLE_SLUG.asc())
								.fetch();
						return views.Profile.profilePublished.template(account, isLoggedIn, likes);
					case followers:
					case following:
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
	}
}
