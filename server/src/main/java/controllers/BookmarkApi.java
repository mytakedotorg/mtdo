/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
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

import static db.Tables.BOOKMARK;
import static db.Tables.BOOKMARKS_MOD;

import auth.AuthUser;
import com.diffplug.common.collect.ImmutableList;
import com.google.inject.Binder;
import com.jsoniter.JsonIterator;
import com.typesafe.config.Config;
import common.DbMisc;
import common.RedirectException;
import common.Time;
import db.tables.records.BookmarkRecord;
import java.time.LocalDateTime;
import java.util.List;
import java2ts.Bookmark;
import java2ts.Json.JsonList;
import java2ts.Routes;
import org.jetbrains.annotations.Nullable;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Mutant;
import org.jooby.Request;
import org.jooby.Result;
import org.jooby.Status;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep5;

public class BookmarkApi implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) {
		env.router().get(Routes.API_BOOKMARKS, req -> {
			AuthUser auth = AuthUser.authApi(req);
			DSLContext dsl = req.require(DSLContext.class);
			LocalDateTime lastSaved = DbMisc.fetchOne(dsl, BOOKMARKS_MOD.SAVED_BY, auth.id(), BOOKMARKS_MOD.LAST_MOD);
			if (lastSaved == null) {
				// user has never had bookmarks 
				return ImmutableList.of();
			} else {
				LocalDateTime ifModifiedSince = ifModifiedSince(req);
				if (ifModifiedSince != null && lastSaved.compareTo(ifModifiedSince) >= 0) {
					return new Result().status(Status.NOT_MODIFIED);
				} else {
					List<BookmarkRecord> records = DbMisc.selectWhere(dsl, BOOKMARK.SAVED_BY, auth.id()).fetch();
					List<Bookmark> pojos = new JsonList<>(Bookmark.LIST, records.size());
					for (BookmarkRecord record : records) {
						pojos.add(toPojo(record));
					}
					return lastModified(lastSaved).set(pojos);
				}
			}
		});
		env.router().put(Routes.API_BOOKMARKS, req -> {
			AuthUser auth = AuthUser.authApi(req);
			List<Bookmark> bookmarks = bookmarks(req);
			if (bookmarks.isEmpty()) {
				return new Result().status(Status.OK);
			}
			DSLContext dsl = req.require(DSLContext.class);
			LocalDateTime now = req.require(Time.class).now();
			InsertValuesStep5<BookmarkRecord, Integer, LocalDateTime, String, Integer, Integer> insert = dsl.insertInto(BOOKMARK,
					BOOKMARK.SAVED_BY, BOOKMARK.SAVED_ON, BOOKMARK.FACT, BOOKMARK.CUT_START, BOOKMARK.CUT_END);
			for (Bookmark bookmark : bookmarks) {
				insert = insert.values(auth.id(), now, bookmark.fact, bookmark.start, bookmark.end);
			}
			// because we update timestamps on duplicate keys, there will always be an update
			insert.onDuplicateKeyUpdate().set(BOOKMARK.SAVED_ON, now).execute();
			setLastModified(dsl, auth, now);
			return lastModified(now).status(Status.CREATED);
		});
		env.router().delete(Routes.API_BOOKMARKS, req -> {
			AuthUser auth = AuthUser.authApi(req);
			List<Bookmark> bookmarks = bookmarks(req);
			if (bookmarks.isEmpty()) {
				return new Result().status(Status.OK);
			}
			DSLContext dsl = req.require(DSLContext.class);
			for (Bookmark bookmark : bookmarks) {
				dsl.deleteFrom(BOOKMARK)
						.where(BOOKMARK.SAVED_BY.eq(auth.id())
								.and(BOOKMARK.FACT.eq(bookmark.fact))
								.and(BOOKMARK.CUT_START.eq(bookmark.start))
								.and(BOOKMARK.CUT_END.eq(bookmark.end)))
						.execute();
			}
			LocalDateTime now = req.require(Time.class).now();
			dsl.update(BOOKMARKS_MOD)
					.set(BOOKMARKS_MOD.LAST_MOD, now)
					.where(BOOKMARKS_MOD.SAVED_BY.eq(auth.id()))
					.execute();
			return lastModified(now).status(Status.OK);
		});
	}

	private static void setLastModified(DSLContext dsl, AuthUser auth, LocalDateTime now) {
		dsl.insertInto(BOOKMARKS_MOD,
				BOOKMARKS_MOD.SAVED_BY, BOOKMARKS_MOD.LAST_MOD)
				.values(auth.id(), now)
				.onDuplicateKeyUpdate().set(BOOKMARKS_MOD.LAST_MOD, now)
				.execute();
	}

	private static List<Bookmark> bookmarks(Request req) throws Exception {
		return JsonIterator.deserialize(req.body(byte[].class), Bookmark.LIST);
	}

	private static Result lastModified(LocalDateTime now) {
		return new Result().header("Last-Modified", Time.toGMT(now));
	}

	private static @Nullable LocalDateTime ifModifiedSince(Request req) {
		Mutant lastModified = req.header("If-Modified-Since");
		if (lastModified.isSet()) {
			try {
				return Time.parseGMT(lastModified.value());
			} catch (Exception e) {
				throw RedirectException.notFoundError("unable to parse " + lastModified.value());
			}
		} else {
			return null;
		}
	}

	private static Bookmark toPojo(BookmarkRecord record) {
		Bookmark bookmark = new Bookmark();
		bookmark.savedAt = Time.toIso(record.getSavedOn());
		bookmark.fact = record.getFact();
		bookmark.start = record.getCutStart();
		bookmark.end = record.getCutEnd();
		return bookmark;
	}
}
