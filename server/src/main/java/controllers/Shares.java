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
import com.jsoniter.JsonIterator;
import com.typesafe.config.Config;
import common.IpGetter;
import common.NotFound;
import common.Time;
import db.tables.records.SharedFactsRecord;
import java.math.BigDecimal;
import java.util.Base64;
import java2ts.Routes;
import java2ts.Share;
import jsweet.util.tuple.Tuple2;
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
		env.router().get(Routes.ANONYMOUS + "/:title/:urlversion/:base64", req -> {
			String titleSlug = req.param("title").value();
			String urlVersion = req.param("urlversion").value();
			String base64Str = req.param("base64").value();
			byte[] decodedBytes = Base64.getDecoder().decode(base64Str);
			String decodedStr = new String(decodedBytes, "UTF-8");
			Share.ShareReq shareReq = JsonIterator.deserialize(decodedStr).as(Share.ShareReq.class);
			String imgPath = "/";
			if (shareReq.vidId != null) {
				imgPath += shareReq.vidId + "_" + shareReq.hStart + "-" + shareReq.hEnd + ".jpg";
			} else if (shareReq.docId != null) {
				if (shareReq.vStart == null || shareReq.vEnd == null) {
					throw new IllegalArgumentException("Expected document to have a view range.");
				}
				imgPath += shareReq.docId + "_" + shareReq.hStart + "-" + shareReq.hEnd + "_" + shareReq.vStart + "-" + shareReq.vEnd + ".jpg";
			} else {
				throw new IllegalArgumentException("Expected shareReq to have either a docId or a vidId.");
			}
			return views.Takes.anonymousTake.template(shareReq.title, imgPath);
		});
		env.router().get(Routes.API_IMAGES + "/:imgkey", req -> {
			// Expect imgKey for videos to be like "/vidId_hStart-hEnd.jpg
			// Expect imgKey for docs to be like "/docId_hStart-hEnd_vStart-vEnd.jpg
			String imgKeyAndExtension = req.param("imgkey").value();
			String imgKey = imgKeyAndExtension.substring(0, imgKeyAndExtension.lastIndexOf("."));
			String imgArr[] = imgKey.split("_");
			if (imgArr.length == 2) {
				// Video fact
				String vidId = imgArr[0];
				String hRangeStr = imgArr[1];
				Tuple2<Float, Float> hRange = rangeFromString(hRangeStr);
				return NotFound.result();
			} else if (imgArr.length == 3) {
				// Document fact
				String docId = imgArr[0];
				String hRangeStr = imgArr[1];
				String vRangeStr = imgArr[2];
				Tuple2<Float, Float> hRange = rangeFromString(hRangeStr);
				Tuple2<Float, Float> vRange = rangeFromString(vRangeStr);
				if (hRange == null || vRange == null) {
					return NotFound.result();
				}
				return "TODO: generate base64 image string";
			} else {
				return NotFound.result();
			}
		});
	}

	private static Tuple2<Float, Float> rangeFromString(String rangeStr) {
		String rangeArr[] = rangeStr.split("-");
		if (rangeArr.length != 2) {
			return null;
		}
		try {
			float start = Float.parseFloat(rangeArr[0]);
			float end = Float.parseFloat(rangeArr[1]);
			return new Tuple2<Float, Float>(start, end);
		} catch (NumberFormatException e) {
			return null;
		}
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
