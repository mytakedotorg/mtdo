/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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

import com.diffplug.common.base.Unhandled;
import common.DbMisc;
import common.Ip;
import common.Time;
import db.tables.records.AccountRecord;
import forms.meta.Validator;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java2ts.LoginApi;
import javax.annotation.Nullable;
import org.jooby.Cookie;
import org.jooby.Request;
import org.jooby.Result;
import org.jooby.Results;
import org.jooq.DSLContext;

/**
 * Our account model is a little complex, because of the following story:
 * 
 * - new user performs a search, bookmarks a result
 * - we ask for their email in order to save that result
 * - they can keep using the site with their unconfirmed account
 *    - all their data is deleted in 48 hrs if not verified
 *    - if they click verification email then their account is confirmed
 * - now they have a confirmed account (can save data and receive emails), but no public username
 * - if they want to publish a take or post on the meta.mytake.org forums, they can claim a public username
 */
class Accounts {
	static Result postToApiRoute(Request req) throws Exception {
		LoginApi.Req loginReq = req.body(LoginApi.Req.class);
		if (loginReq.kind.equals("newsletter")) {
			return subscribeToMailingList(loginReq.email, req).toResult(req);
		} else {
			// @formatter:off
			IfNoAccount ifNoAccount; 
			switch (loginReq.kind) {
			case "use":   ifNoAccount = IfNoAccount.CREATE; break;
			case "login": ifNoAccount = IfNoAccount.ERROR;  break;
			default: throw Unhandled.stringException(loginReq.kind);
			}
			// @formatter:on
			return login(loginReq.email, ifNoAccount, req).toResult(req);
		}
	}

	enum IfNoAccount {
		CREATE, ERROR;

		public boolean create() {
			return this == CREATE;
		}
	}

	/** Performs the server-side of a login operation. */
	static Msg login(String emailRaw, IfNoAccount ifNoAccount, Request req) {
		if (!Validator.isValidEmail(emailRaw)) {
			return invalidEmail(emailRaw);
		}
		try (DSLContext dsl = req.require(DSLContext.class)) {
			String email = emailRaw.toLowerCase(Locale.ROOT);
			AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.EMAIL, email);
			if (account == null) {
				account = newAccount(email, req);
				if (ifNoAccount.create()) {
					return Msg.titleBodyBtn("Welcome aboard!",
							"We sent you an email with more details about what we're building together. Keep exploring and read it when you get a chance.",
							"Okay, I'll read it later.").andLoginCookieFor(account)
							.andSendLoginEmailTo(account);
				} else {
					return Msg.titleBodyBtn("Not found",
							emailRaw + " does not have an account. Check the spelling.",
							"Okay, I'll try again");
				}
			} else {
				return Msg.titleBodyBtn("Welcome back!",
						"We sent you an email with a login link.",
						"Okay, I'll check my email").andSendLoginEmailTo(account);
			}
		}
	}

	/** Performs the server-side of a "subscribe to mailing list" operation. */
	static Msg subscribeToMailingList(String emailRaw, Request req) {
		String email = emailRaw.toLowerCase(Locale.ROOT);
		Optional<AuthUser> authOpt = AuthUser.authOpt(req);
		if (authOpt.isPresent()) {
			if (!authOpt.get().email().equals(email)) {
				return Msg.titleBodyBtn("That's not you!",
						"You can't sign other people up for them, and you're already signed-in as " + authOpt.get().email,
						"Okay, I'll let them do it themselves.");
			}
		} else if (!Validator.isValidEmail(emailRaw)) {
			return invalidEmail(emailRaw);
		}
		try (DSLContext dsl = req.require(DSLContext.class)) {
			AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.EMAIL, email);
			if (account == null) {
				account = newAccount(email, req);
				return Msg.titleBodyBtn("Welcome aboard!",
						"We sent you an email with more details about what we're building together. Keep exploring and read it when you get a chance.",
						"Okay, I'll read it later.").andLoginCookieFor(account)
						.andSendLoginEmailTo(account);
			} else {
				account.setNewsletter(true);
				if (account.getConfirmedAt() != null) {
					return Msg.titleBodyBtn("We'll be in touch!",
							"You're signed up for our newsletter, and we'll keep you up to date on what we're building together.",
							"Okay, I look forward to it.").andSendLoginEmailTo(account);

				} else {
					return Msg.titleBodyBtn("Check your email!",
							"We sent you a message to confirm that you want to hear from us. If you don't click the confirm link, you won't get our newsletter.",
							"Okay, I'll check my email").andSendLoginEmailTo(account);
				}
			}
		}
	}

	private static Msg invalidEmail(String emailRaw) {
		return Msg.titleBodyBtn("Invalid email",
				emailRaw + " is not a valid email. Check the spelling.",
				"Okay, I'll try again");
	}

	private static AccountRecord newAccount(String email, Request req) {
		LocalDateTime now = req.require(Time.class).now();
		String ip = Ip.get(req);

		AccountRecord account = new AccountRecord();
		account.setEmail(email);
		account.setCreatedAt(now);
		account.setCreatedIp(ip);
		account.setUpdatedAt(now);
		account.setUpdatedIp(ip);
		account.setLastSeenAt(now);
		account.setLastSeenIp(ip);
		account.setLastEmailedAt(now);
		account.setNewsletter(true);
		return account;
	}

	static class Msg {
		String title;
		String body;
		String btn;
		@Nullable
		AccountRecord sendLoginEmailTo;
		@Nullable
		AccountRecord loginCookieFor;

		static Msg titleBodyBtn(String title, String body, String btn) {
			Msg msg = new Msg();
			msg.title = title;
			msg.body = body;
			msg.btn = btn;
			return msg;
		}

		Msg andSendLoginEmailTo(AccountRecord sendLoginEmailTo) {
			this.sendLoginEmailTo = sendLoginEmailTo;
			return this;
		}

		Msg andLoginCookieFor(AccountRecord loginCookieFor) {
			this.loginCookieFor = loginCookieFor;
			return this;
		}

		Result toResult(Request req) {
			LoginApi.Res res = new LoginApi.Res();
			res.title = title;
			res.body = body;
			res.btn = btn;
			Result result = Results.ok(res);
			if (loginCookieFor != null) {
				for (Cookie cookie : AuthUser.login(loginCookieFor, req)) {
					result.header("Set-Cookie", cookie.encode());
				}
			}
			if (sendLoginEmailTo != null) {
				// TODO: send login email
			}
			return result;
		}
	}
}
