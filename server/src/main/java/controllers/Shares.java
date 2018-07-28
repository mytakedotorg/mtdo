/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
