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
import db.enums.ShareMethod;
import db.tables.records.SharedFactsRecord;
import java.math.BigDecimal;
import java2ts.Routes;
import java2ts.Share;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooq.DSLContext;

/**
 * - when a take is first opened, post to {@link Routes#API_TAKE_VIEW}.
 * - when a user reacts to a take, post to {@link Routes#API_TAKE_REACT}.
 */
public class Shares implements Jooby.Module {
	private static final int URL_VERSION = 1;
	private static final int FOUNDATION_VERSION = 1;

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// when a fact is shared
		env.router().post(Routes.API_SHARE, req -> {
			AuthUser user = AuthUser.authOpt(req).orElse(null);
			Share.ShareReq shareReq = req.body(Share.ShareReq.class);
			try (DSLContext dsl = req.require(DSLContext.class)) {
				logShare(dsl, shareReq, user);
				return "todo";
			}
		});
	}

	private static void logShare(DSLContext dsl, Share.ShareReq shareReq, AuthUser user) {
		SharedFactsRecord record = dsl.newRecord(SHARED_FACTS);
		if (user != null) {
			record.setSharedBy(user.id());
		}
		record.setTitle(shareReq.title);
		record.setFoundationVersion(FOUNDATION_VERSION);
		record.setUrlVersion(URL_VERSION);
		record.setMethod(parseMethod(shareReq.method));
		record.setFactSlug(shareReq.factSlug);
		record.setHighlightStart(new BigDecimal(shareReq.highlightedRange.$0));
		record.setHighlightEnd(new BigDecimal(shareReq.highlightedRange.$1));
		if (shareReq.viewRange != null) {
			record.setViewStart(new BigDecimal(shareReq.viewRange.$0));
			record.setViewEnd(new BigDecimal(shareReq.viewRange.$1));
		}
		record.insert();
	}

	private static ShareMethod parseMethod(String methodStr) {
		ShareMethod method;
		switch (methodStr) {
		case Share.METHOD_EMAIL:
			method = ShareMethod.email;
			break;
		case Share.METHOD_FACEBOOK:
			method = ShareMethod.facebook;
			break;
		case Share.METHOD_TWITTER:
			method = ShareMethod.twitter;
			break;
		default:
			throw new IllegalArgumentException("Could not determine share method");
		}
		return method;
	}
}
