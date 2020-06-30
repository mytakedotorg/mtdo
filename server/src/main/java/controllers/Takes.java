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
import static db.Tables.TAKEPUBLISHED;

import com.google.inject.Binder;
import com.jsoniter.JsonIterator;
import com.typesafe.config.Config;
import common.NotFound;
import common.Text;
import db.tables.records.TakepublishedRecord;
import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java2ts.Routes;
import java2ts.Share;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Request;
import org.jooby.internal.RoutePattern;
import org.jooq.DSLContext;

public class Takes implements Jooby.Module {
	private static final RoutePattern USER_TITLE = new RoutePattern("GET", "/:user/:title");
	private static final RoutePattern USER_SHARE = new RoutePattern("GET", "/:user/:title/:urlversion/:base64");
	private static final RoutePattern ANON_SHARE = new RoutePattern("GET", Routes.ANONYMOUS + "/:title/:urlversion/:base64");

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(USER_TITLE.pattern(), req -> {
			String user = Text.lowercase(req, "user");
			String title = Text.lowercase(req, "title");
			try (DSLContext dsl = req.require(DSLContext.class)) {
				TakepublishedRecord take = dsl.selectFrom(TAKEPUBLISHED)
						// needs to be titleslug then userid for the postgres index to work
						.where(TAKEPUBLISHED.TITLE_SLUG.eq(title))
						.and(TAKEPUBLISHED.USER_ID.eq(dsl.select(ACCOUNT.ID)
								.from(ACCOUNT)
								.where(ACCOUNT.USERNAME.eq(user))))
						.fetchOne();
				if (take == null) {
					return NotFound.result();
				} else {
					String imageUrl = take.getImageUrl();
					return views.Takes.showTake.template(take, imageUrl);
				}
			}
		});
		env.router().get(ANON_SHARE.pattern(), Takes::renderShare);
		env.router().get(USER_SHARE.pattern(), Takes::renderShare);
	}

	private static Object renderShare(Request req) throws UnsupportedEncodingException {
		String titleSlug = req.param("title").value();
		String base64Str = req.param("base64").value();
		byte[] decodedBytes = Base64.getDecoder().decode(base64Str);
		String decodedStr = new String(decodedBytes, "UTF-8");
		Share.ShareReq shareReq = JsonIterator.deserialize(decodedStr).as(Share.ShareReq.class);
		String imgPath;
		if (shareReq.vidId != null) {
			imgPath = vidImageUrl(shareReq.vidId, shareReq.hStart, shareReq.hEnd);
		} else if (shareReq.docId != null) {
			imgPath = docImageUrl(shareReq.docId, shareReq.hStart, shareReq.hEnd, shareReq.vStart, shareReq.vEnd);
		} else {
			throw new IllegalArgumentException("Expected shareReq to have either a docId or a vidId.");
		}
		return views.Takes.anonymousTake.template(shareReq.title, imgPath);
	}

	public static String userTitleSlug(String user, String titleSlug) {
		return "/" + user + "/" + titleSlug;
	}

	public static String docImageUrl(String titleSlug, String hStart, String hEnd, String vStart, String vEnd) {
		if (vStart == null || vEnd == null) {
			throw new IllegalArgumentException("Expected document to have a view range.");
		}
		return "/" + titleSlug + "_" + hStart + "-" + hEnd + "_" + vStart + "-" + vEnd + ".png";
	}

	public static String vidImageUrl(String titleSlug, String hStart, String hEnd) {
		return "/" + titleSlug + "_" + hStart + "-" + hEnd + ".png";
	}
}
