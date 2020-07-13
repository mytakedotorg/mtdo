/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import auth.AuthUser;
import com.diffplug.common.base.Unhandled;
import com.google.common.collect.ImmutableSet;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.IpGetter;
import common.Mods;
import common.Time;
import db.enums.Reaction;
import db.tables.records.TakereactionRecord;
import java.util.List;
import java2ts.Routes;
import java2ts.TakeReactionJson;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Request;
import org.jooq.DSLContext;
import org.jooq.Record;

/**
 * - when a take is first opened, post to {@link Routes#API_TAKE_VIEW}.
 * - when a user reacts to a take, post to {@link Routes#API_TAKE_REACT}.
 */
public class TakeReaction implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// when a take is opened
		env.router().post(Routes.API_TAKE_VIEW, req -> {
			AuthUser user = AuthUser.authOpt(req).orElse(null);
			TakeReactionJson.ViewReq viewReq = req.body(TakeReactionJson.ViewReq.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakeReactionJson.ViewRes viewRes = new TakeReactionJson.ViewRes();
				if (user != null) {
					List<Reaction> reactions = reactionsForUser(dsl, viewReq.take_id, user);
					viewRes.userState = userState(reactions);
					if (!reactions.contains(Reaction.view)) {
						setReaction(dsl, req, viewReq.take_id, user, Reaction.view, true);
					}
				}
				viewRes.takeState = takeState(dsl, viewReq.take_id);
				return viewRes;
			}
		});
		// when a take is reacted to (liked, bookmarked, etc)
		env.router().post(Routes.API_TAKE_REACT, req -> {
			AuthUser user = AuthUser.auth(req);
			TakeReactionJson.ReactReq reactReq = req.body(TakeReactionJson.ReactReq.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				String email = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.ID.eq(user.id()))
						.fetchOne(ACCOUNT.EMAIL);
				Record titleRecord = dsl.select(TAKEPUBLISHED.TITLE, TAKEPUBLISHED.TITLE_SLUG, TAKEPUBLISHED.USER_ID)
						.from(TAKEPUBLISHED)
						.where(TAKEPUBLISHED.ID.eq(reactReq.take_id))
						.fetchOne();
				String authorUsername = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.ID.eq(titleRecord.get(TAKEPUBLISHED.USER_ID)))
						.fetchOne(ACCOUNT.USERNAME);

				TakeReactionJson.ReactRes reactRes = new TakeReactionJson.ReactRes();
				List<Reaction> reactions = reactionsForUser(dsl, reactReq.take_id, user);
				for (Reaction reaction : REACTIONS_NON_VIEW) {
					boolean command = getReaction(reactReq.userState, reaction);
					if (command != reactions.contains(reaction)) {
						if (ABUSE.contains(reaction)) {
							req.require(Mods.class).send(htmlEmail -> htmlEmail
									.setSubject(user.username() + " " + (command ? "marked" : "unmarked") + " '" + titleRecord.get(TAKEPUBLISHED.TITLE) + "' as " + reaction)
									.setMsg(Mods.table(
											"user", user.username(),
											"email", email,
											"reaction", reaction.toString(),
											"link", "https://mytake.org/" + authorUsername + "/" + titleRecord.get(TAKEPUBLISHED.TITLE_SLUG))));
						}
						setReaction(dsl, req, reactReq.take_id, user, reaction, command);
					}
				}
				reactRes.takeState = takeState(dsl, reactReq.take_id);
				reactRes.userState = reactReq.userState;
				return reactRes;
			}
		});
	}

	///////////////
	// TakeState //
	///////////////
	private static TakeReactionJson.TakeState takeState(DSLContext dsl, int take_id) {
		TakeReactionJson.TakeState takeState = new TakeReactionJson.TakeState();
		takeState.viewCount = countForAllUsers(dsl, take_id, Reaction.view);
		takeState.likeCount = countForAllUsers(dsl, take_id, Reaction.like);
		return takeState;
	}

	private static int countForAllUsers(DSLContext dsl, int takeId, Reaction reaction) {
		return dsl.fetchCount(
				dsl.selectFrom(TAKEREACTION)
						.where(TAKEREACTION.TAKE_ID.eq(takeId)
								.and(TAKEREACTION.KIND.eq(reaction))));
	}

	///////////////
	// UserState //
	///////////////
	private static List<Reaction> reactionsForUser(DSLContext dsl, int takeId, AuthUser user) {
		return dsl.selectFrom(TAKEREACTION)
				.where(TAKEREACTION.TAKE_ID.eq(takeId).and(TAKEREACTION.USER_ID.eq(user.id())))
				.fetch(TAKEREACTION.KIND);
	}

	private static TakeReactionJson.UserState userState(List<Reaction> reactions) {
		TakeReactionJson.UserState userState = new TakeReactionJson.UserState();
		for (Reaction reaction : REACTIONS_NON_VIEW) {
			setReaction(userState, reaction, reactions.contains(reaction));
		}
		return userState;
	}

	private static void setReaction(DSLContext dsl, Request req, int take_id, AuthUser user, Reaction reaction, boolean command) {
		if (command) {
			TakereactionRecord record = dsl.newRecord(TAKEREACTION);
			record.setTakeId(take_id);
			record.setUserId(user.id());
			record.setKind(reaction);
			record.setReactedAt(req.require(Time.class).nowTimestamp());
			record.setReactedIp(req.require(IpGetter.class).ip(req));
			record.store();
		} else {
			dsl.deleteFrom(TAKEREACTION).where(
					TAKEREACTION.TAKE_ID.eq(take_id)
							.and(TAKEREACTION.USER_ID.eq(user.id())
									.and(TAKEREACTION.KIND.eq(reaction))))
					.execute();
		}
	}

	// @formatter:off
	// Reaction.illegal is cruft, but hard to delete: https://stackoverflow.com/questions/25811017/how-to-delete-an-enum-type-value-in-postgres
	static final Reaction[] REACTIONS_NON_VIEW = new Reaction[] {
			Reaction.like,
			Reaction.bookmark,
			Reaction.spam,
			Reaction.harassment,
			Reaction.rulesviolation
	};

	static final ImmutableSet<Reaction> ABUSE = ImmutableSet.of(Reaction.spam, Reaction.harassment, Reaction.rulesviolation);

	private static void setReaction(TakeReactionJson.UserState state, Reaction reaction, boolean value) {
		switch (reaction) {
		case like:			state.like = value;				break;
		case bookmark:		state.bookmark = value;			break;
		case spam:			state.spam = value;				break;
		case harassment:		state.harassment = value;		break;
		case rulesviolation:	state.rulesviolation = value;	break;
		default: throw Unhandled.enumException(reaction);
		}
	}

	static boolean getReaction(TakeReactionJson.UserState state, Reaction reaction) {
		switch (reaction) {
		case like:			return state.like;
		case bookmark:		return state.bookmark;
		case spam:			return state.spam;
		case harassment:		return state.harassment;
		case rulesviolation:	return state.rulesviolation;
		default: throw Unhandled.enumException(reaction);
		}
	}
	// @formatter:on
}
