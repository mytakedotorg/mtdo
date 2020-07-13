/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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

import static db.Tables.SHARED_FACTS;

import auth.AuthUser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.IpGetter;
import common.Time;
import db.tables.records.SharedFactsRecord;
import java.math.BigDecimal;
import java2ts.Routes;
import java2ts.Share;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Request;
import org.jooq.DSLContext;

/**
 * - when a take is first opened, post to {@link Routes#API_TAKE_VIEW}.
 * - when a user reacts to a take, post to {@link Routes#API_TAKE_REACT}.
 */
public class Shares implements Jooby.Module {
	private static final int URL_VERSION = 1;

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// when a fact is shared
		env.router().post(Routes.API_SHARE, req -> {
			AuthUser user = AuthUser.authOpt(req).orElse(null);
			Share.ShareReq shareReq = req.body(Share.ShareReq.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				logShare(dsl, req, shareReq, user);
				return new Share.ShareRes();
			}
		});
	}

	private static void logShare(DSLContext dsl, Request req, Share.ShareReq shareReq, AuthUser user) {
		SharedFactsRecord record = dsl.newRecord(SHARED_FACTS);
		if (user != null) {
			record.setSharedBy(user.id());
		}
		record.setSharedOn(req.require(Time.class).nowTimestamp());
		record.setSharedIp(req.require(IpGetter.class).ip(req));
		record.setTitle(shareReq.title);
		record.setUrlVersion(URL_VERSION);
		if (shareReq.vidId != null && shareReq.docId != null) {
			throw new IllegalArgumentException("Request cannot have both a video and a document Id.");
		}
		String factId;
		if (shareReq.vidId != null) {
			factId = shareReq.vidId;
		} else if (shareReq.docId != null) {
			factId = shareReq.docId;
		} else {
			throw new IllegalArgumentException("Request should have either a video Id or a document Id.");
		}
		record.setFactid(factId);
		record.setHighlightStart(new BigDecimal(shareReq.hStart));
		record.setHighlightEnd(new BigDecimal(shareReq.hEnd));
		if (shareReq.vStart != null && shareReq.vEnd != null) {
			record.setViewStart(new BigDecimal(shareReq.vStart));
			record.setViewEnd(new BigDecimal(shareReq.vEnd));
		}
		record.insert();
	}
}
