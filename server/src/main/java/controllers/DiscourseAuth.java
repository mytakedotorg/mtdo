/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;

import auth.AuthUser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import db.tables.records.AccountRecord;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java2ts.Routes;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Hex;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Request;
import org.jooby.Results;
import org.jooq.DSLContext;
import org.postgresql.util.Base64;

/**
 * SSO for Discourse, the spec is here: https://meta.discourse.org/t/official-single-sign-on-for-discourse-sso/13045
 * 
 * Thanks to the following examples.  They didn't "drop right in", but they were a helpful start.
 *
 * https://github.com/KevinWorkman/StaticVoidGames/blob/master/StaticVoidGames/src/main/java/com/StaticVoidGames/spring/config/LoginSuccessHandler.java
 * https://meta.discourse.org/t/sso-example-for-jsp/22786
 */
public class DiscourseAuth implements Jooby.Module {
	private static final String DISCOURSE = "https://meta.mytake.org";
	private static final String DISCOURSE_SSO = DISCOURSE + "/session/sso_login";
	protected static final String SECRET_KEY = "discourse.secret";

	/** Appends the user's info to the Nonce, fields from. */
	protected String appendUserInfoToNonce(Request req, String nonce) throws UnsupportedEncodingException {
		// find logged-in user
		AuthUser auth = AuthUser.auth(req);
		AccountRecord account;
		try (DSLContext dsl = req.require(DSLContext.class)) {
			account = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.ID.eq(auth.id()))
					.fetchOne();
		}
		// return the logged-in user
		String name = Optional.ofNullable(account.getName()).orElse(account.getUsername());
		return nonce
				+ "&name=" + urlEncode(name)
				+ "&username=" + urlEncode(account.getUsername())
				+ "&email=" + urlEncode(account.getEmail())
				+ "&external_id=" + urlEncode(account.getId().toString());
	}

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		if (!conf.hasPath(SECRET_KEY)) {
			return;
		}
		byte[] keyBytes = conf.getString(SECRET_KEY).getBytes(StandardCharsets.UTF_8);
		SecretKeySpec key = new SecretKeySpec(keyBytes, "HmacSHA256");
		env.router().get(Routes.API + "/discourseAuth", req -> {
			// validate request from server
			String payload = urlDecode(req.param("sso").value());
			String sig = req.param("sig").value();
			if (!checksum(key, payload).equals(sig)) {
				throw new IllegalArgumentException("Invalid signature");
			}
			// decode the nonce
			String nonce = decodeBase64(payload);
			String response = appendUserInfoToNonce(req, nonce);
			String response64 = encodeBase64(response);
			if (!response64.endsWith("\n")) {
				response64 += "\n";
			}
			return Results.redirect(DISCOURSE_SSO + "?sso=" + urlEncode(response64) + "&sig=" + checksum(key, response64));
		});
	}

	protected static String urlEncode(String input) throws UnsupportedEncodingException {
		return URLEncoder.encode(input, StandardCharsets.UTF_8.name());
	}

	protected static String urlDecode(String input) throws UnsupportedEncodingException {
		return URLDecoder.decode(input, StandardCharsets.UTF_8.name());
	}

	private static String checksum(SecretKeySpec key, String macData) throws NoSuchAlgorithmException, UnsupportedEncodingException, InvalidKeyException {
		Mac mac = Mac.getInstance("HmacSHA256");
		mac.init(key);
		byte[] doFinal = mac.doFinal(macData.getBytes(StandardCharsets.UTF_8));
		return Hex.encodeHexString(doFinal);
	}

	private static String decodeBase64(String input) throws UnsupportedEncodingException {
		return new String(Base64.decode(input), StandardCharsets.UTF_8);
	}

	private static String encodeBase64(String input) throws UnsupportedEncodingException {
		return Base64.encodeBytes(input.getBytes(StandardCharsets.UTF_8));
	}
}
