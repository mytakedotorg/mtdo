/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package auth;

import static db.Tables.MODERATOR;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.jsoniter.output.JsonStream;
import common.NotFound;
import common.Time;
import common.UrlEncodedPath;
import db.tables.pojos.Account;
import java.text.ParseException;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java2ts.LoginCookie;
import javax.annotation.Nullable;
import org.jooby.Cookie;
import org.jooby.Mutant;
import org.jooby.Registry;
import org.jooby.Request;
import org.jooby.Response;
import org.jooq.DSLContext;

public class AuthUser {
	public static final int LOGIN_DAYS = 7;

	final int id;
	final String username;

	public AuthUser(int id, String username) {
		this.id = id;
		this.username = username;
	}

	public int id() {
		return id;
	}

	public String username() {
		return username;
	}

	public void requireMod(DSLContext dsl) {
		boolean isMod = dsl.fetchCount(dsl.selectFrom(MODERATOR).where(MODERATOR.ID.eq(id))) == 1;
		if (!isMod) {
			throw NotFound.exception();
		}
	}

	static JWTCreator.Builder forUser(Account account, Time time) {
		return JWT.create()
				.withIssuer(ISSUER_AUDIENCE)
				.withAudience(ISSUER_AUDIENCE)
				.withIssuedAt(time.nowDate())
				.withSubject(Integer.toString(account.getId()))
				.withClaim(CLAIM_USERNAME, account.getUsername());
	}

	static String jwtToken(Registry registry, Account user) {
		return forUser(user, registry.require(Time.class))
				.sign(registry.require(Algorithm.class));
	}

	static final String ISSUER_AUDIENCE = "mytake.org";
	static final String CLAIM_USERNAME = "username";

	/**
	 * If there's a cookie, validate the user, else return empty.
	 * If there's an invalid cookie, throw a JWTVerificationException
	 */
	public static Optional<AuthUser> authOpt(Request req) throws JWTVerificationException {
		Mutant loginCookie = req.cookie(LOGIN_COOKIE);
		if (!loginCookie.isSet()) {
			return Optional.empty();
		} else {
			return Optional.of(auth(req));
		}
	}

	/** Extracts the current AuthUser from the request, or throws a JWTVerificationException. */
	public static AuthUser auth(Request req) throws JWTVerificationException {
		// we might have done this for the request already, let's check
		AuthUser existing = req.get(REQ_LOGIN_STATUS, null);
		if (existing != null) {
			return existing;
		}
		// check that the cookie exists
		Mutant loginCookie = req.cookie(LOGIN_COOKIE);
		if (!loginCookie.isSet()) {
			throw new JWTVerificationException("We can show that to you after you log in.");
		}
		// and that it is authorized
		Algorithm algorithm = req.require(Algorithm.class);
		DecodedJWT decoded = JWT.require(algorithm)
				.withIssuer(ISSUER_AUDIENCE)
				.withAudience(ISSUER_AUDIENCE)
				.build()
				.verify(loginCookie.value());
		if (!req.require(Time.class).isBeforeNowPlus(decoded.getIssuedAt(), LOGIN_DAYS, TimeUnit.DAYS)) {
			throw new TokenExpiredException("Your login timed out.");
		}
		// create the logged-in AuthUser
		int userId = Integer.parseInt(decoded.getSubject());
		String username = decoded.getClaim(CLAIM_USERNAME).asString();

		AuthUser user = new AuthUser(userId, username);
		req.set(REQ_LOGIN_STATUS, user);
		return user;
	}

	static final String LOGIN_COOKIE = "login";
	static final String LOGIN_UI_COOKIE = "loginui";
	private static final String REQ_LOGIN_STATUS = "reqLoginStatus";

	/** Attempts to parse the user's email, even if it isn't an otherwise valid login. */
	static @Nullable String usernameForError(Request req) throws ParseException {
		Mutant loginCookie = req.cookie(LOGIN_COOKIE);
		if (!loginCookie.isSet()) {
			return null;
		} else {
			return JWT.decode(loginCookie.value()).getClaim(CLAIM_USERNAME).asString();
		}
	}

	static void login(Account account, Request req, Response rsp) {
		boolean isSecurable = UrlEncodedPath.isSecurable(req);

		Cookie.Definition httpCookie = new Cookie.Definition(LOGIN_COOKIE, jwtToken(req, account));
		httpCookie.httpOnly(true);
		httpCookie.secure(isSecurable);
		httpCookie.maxAge((int) TimeUnit.DAYS.toSeconds(LOGIN_DAYS));
		rsp.cookie(httpCookie);

		LoginCookie cookie = new LoginCookie();
		cookie.username = account.getUsername();
		Cookie.Definition uiCookie = new Cookie.Definition(LOGIN_UI_COOKIE, JsonStream.serialize(cookie));
		uiCookie.secure(isSecurable);
		uiCookie.maxAge((int) TimeUnit.DAYS.toSeconds(LOGIN_DAYS));
		rsp.cookie(uiCookie);
	}
}
