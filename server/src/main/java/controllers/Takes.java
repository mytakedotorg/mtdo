/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2021 MyTake.org, Inc.
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
import com.typesafe.config.Config;
import common.RedirectException;
import common.SocialEmbed;
import common.Text;
import db.tables.records.TakepublishedRecord;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.internal.RoutePattern;
import org.jooq.DSLContext;

public class Takes implements Jooby.Module {
	private static final RoutePattern USER_TITLE = new RoutePattern("GET", "/:user/:title");

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(USER_TITLE.pattern(), req -> {
			String user = Text.lowercase(req, "user");
			String title = Text.lowercase(req, "title");
			DSLContext dsl = req.require(DSLContext.class);
			TakepublishedRecord take = dsl.selectFrom(TAKEPUBLISHED)
					// needs to be titleslug then userid for the postgres index to work
					.where(TAKEPUBLISHED.TITLE_SLUG.eq(title))
					.and(TAKEPUBLISHED.USER_ID.eq(dsl.select(ACCOUNT.ID)
							.from(ACCOUNT)
							.where(ACCOUNT.USERNAME.eq(user))))
					.fetchOne();
			if (take == null) {
				throw RedirectException.notFoundError();
			}
			String imageUrl = take.getImageUrl();
			return views.Takes.showTake.template(take, SocialEmbed.todo(imageUrl));
		});
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
