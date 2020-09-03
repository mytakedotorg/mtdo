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
package auth;

import static db.Tables.ACCOUNT;
import static db.Tables.MODERATOR;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.diffplug.common.collect.ImmutableList;
import com.jsoniter.output.JsonStream;
import common.DbMisc;
import common.RedirectException;
import common.Time;
import common.UrlEncodedPath;
import db.tables.records.AccountRecord;
import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
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
	final String email;
	final boolean confirmed;

	public AuthUser(int id, String username, String email, boolean confirmed) {
		this.id = id;
		this.username = username;
		this.email = email;
		this.confirmed = confirmed;
	}

	public int id() {
		return id;
	}

	public String username() {
		return username;
	}

	public String email() {
		return email;
	}

	public void requireMod(DSLContext dsl) {
		boolean isMod = dsl.fetchCount(dsl.selectFrom(MODERATOR).where(MODERATOR.ID.eq(id))) == 1;
		if (!isMod) {
			throw RedirectException.notFoundError();
		}
	}

	static JWTCreator.Builder forUser(AccountRecord account, Time time) {
		return JWT.create()
				.withIssuer(ISSUER_AUDIENCE)
				.withAudience(ISSUER_AUDIENCE)
				.withIssuedAt(Time.toJud(time.now()))
				.withSubject(Integer.toString(account.getId()))
				.withClaim(CLAIM_USERNAME, account.getUsername())
				.withClaim(CLAIM_EMAIL, account.getEmail())
				.withClaim(CLAIM_CONFIRMED, Boolean.toString(account.getConfirmedAt() != null));
	}

	static String jwtToken(Registry registry, AccountRecord user) {
		return forUser(user, registry.require(Time.class))
				.sign(registry.require(Algorithm.class));
	}

	static final String ISSUER_AUDIENCE = "mytake.org";
	static final String CLAIM_USERNAME = "username";
	static final String CLAIM_EMAIL = "email";
	static final String CLAIM_CONFIRMED = "confirmed";

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

	/** Extracts the current AuthUser from the request, or sends 403 request. */
	public static AuthUser authApi(Request req) {
		try {
			return auth(req);
		} catch (JWTVerificationException e) {
			boolean refreshMightFix = e instanceof RefreshMightFix;
			throw new AuthModule.Error403(e.getMessage(), refreshMightFix);
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
		if (req.require(Time.class).now().isAfter(Time.fromJud(decoded.getIssuedAt()).plus(LOGIN_DAYS, ChronoUnit.DAYS))) {
			throw new TokenExpiredException("Your login timed out.");
		}
		// create the logged-in AuthUser
		int userId = Integer.parseInt(decoded.getSubject());
		String username = decoded.getClaim(CLAIM_USERNAME).asString();
		String email = decoded.getClaim(CLAIM_EMAIL).asString();
		String confirmed = decoded.getClaim(CLAIM_CONFIRMED).asString();

		AuthUser user = new AuthUser(userId, username, email, Boolean.parseBoolean(confirmed));
		req.set(REQ_LOGIN_STATUS, user);

		if (!user.confirmed) {
			// if a user has an unconfirmed auth cookie, and the user in question
			// authenticates then we need to kick the unauthenticated user out
			try (DSLContext dsl = req.require(DSLContext.class)) {
				boolean isConfirmedNow = DbMisc.fetchOne(dsl, ACCOUNT.ID, userId, ACCOUNT.CONFIRMED_AT) != null;
				if (isConfirmedNow) {
					throw new RefreshMightFix("Your login timed out.");
				}
			}
		}
		return user;
	}

	private static class RefreshMightFix extends TokenExpiredException {
		private static final long serialVersionUID = 3889130945983736480L;

		RefreshMightFix(String message) {
			super(message);
		}
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

	private static Cookie.Definition newCookie(Request req, String name) {
		boolean isSecurable = UrlEncodedPath.isSecurable(req);
		return new Cookie.Definition(name)
				.path("/")
				.secure(isSecurable);
	}

	static List<Cookie> login(AccountRecord account, Request req) {
		List<Cookie> cookies = new ArrayList<>();
		cookies.add(newCookie(req, LOGIN_COOKIE)
				.value(jwtToken(req, account))
				.httpOnly(true)
				.maxAge((int) TimeUnit.DAYS.toSeconds(LOGIN_DAYS))
				.toCookie());
		LoginCookie cookie = new LoginCookie();
		cookie.username = account.getUsername();
		cookie.email = account.getEmail();
		cookie.unconfirmed = account.getConfirmedAt() == null;
		cookies.add(newCookie(req, LOGIN_UI_COOKIE)
				.value(JsonStream.serialize(cookie))
				.httpOnly(false)
				.maxAge((int) TimeUnit.DAYS.toSeconds(LOGIN_DAYS))
				.toCookie());
		return cookies;
	}

	static void clearCookies(Request req, Response rsp) {
		clearCookies(req).forEach(rsp::cookie);
	}

	public static List<Cookie> clearCookies(Request req) {
		return ImmutableList.of(
				newCookie(req, AuthUser.LOGIN_COOKIE).maxAge(0).toCookie(),
				newCookie(req, AuthUser.LOGIN_UI_COOKIE).maxAge(0).toCookie());
	}
}
