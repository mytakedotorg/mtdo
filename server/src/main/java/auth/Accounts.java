/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
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

import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;
import static db.Tables.LOGINLINK;

import com.diffplug.common.base.Unhandled;
import common.DbMisc;
import common.EmailSender;
import common.Ip;
import common.Text;
import common.Time;
import common.UrlEncodedPath;
import common.UrlRandomCode;
import controllers.HomeFeed;
import db.VarChars;
import db.tables.records.AccountRecord;
import db.tables.records.LoginlinkRecord;
import forms.api.FormValidation;
import forms.api.FormValidation.Sensitive;
import forms.meta.MetaField;
import forms.meta.PostForm;
import java.net.URLDecoder;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java2ts.LoginApi;
import java2ts.Routes;
import org.jetbrains.annotations.Nullable;
import org.jooby.Cookie;
import org.jooby.Request;
import org.jooby.Response;
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
public class Accounts {
	static Result postToApiRoute(Request req) throws Exception {
		LoginApi.Req loginReq = req.body(LoginApi.Req.class);
		loginReq.email = Text.lowercase(loginReq.email);
		if (loginReq.kind.equals(KIND_NEWSLETTER)) {
			return subscribeToMailingList(loginReq.email, req).toJsResult(req);
		} else {
			return login(loginReq, req).toJsResult(req);
		}
	}

	private static final String KIND_NEWSLETTER = "newsletter";
	private static final String KIND_USE = "use";
	private static final String KIND_LOGIN = "login";

	enum IfNoAccount {
		CREATE, ERROR;

		public boolean isCreate() {
			return this == CREATE;
		}

		static IfNoAccount forKind(LoginApi.Req login) {
			// @formatter:off
			switch (login.kind) {
			case KIND_USE:   return IfNoAccount.CREATE;
			case KIND_LOGIN: return IfNoAccount.ERROR;
			default: throw Unhandled.stringException(login.kind);
			}
			// @formatter:on
		}
	}

	/** Performs the server-side of a login operation. */
	static Msg login(LoginApi.Req login, Request req) {
		if (!isValidEmail(login.email)) {
			return invalidEmail(login.email);
		}

		DSLContext dsl = req.require(DSLContext.class);
		AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.EMAIL, login.email);
		if (account == null) {
			account = newAccount(login.email, req, dsl);
			if (IfNoAccount.forKind(login) == IfNoAccount.CREATE) {
				return Msg.titleBodyBtn("Welcome aboard!",
						"We sent you an email with more details about what we're building together. Keep exploring and read it when you get a chance.",
						"Okay, I'll read it later.")
						.andLoginCookieFor(account)
						.andSendLoginEmailTo(account, login);
			} else {
				return Msg.titleBodyBtn("Not found",
						login.email + " does not have an account. Check the spelling.",
						"Okay, I'll try again.");
			}
		} else {
			return Msg.titleBodyBtn("Welcome back!",
					"We sent you an email with a login link.",
					"Okay, I'll check my email.")
					.andSendLoginEmailTo(account, login);
		}
	}

	/** Performs the server-side of a "subscribe to mailing list" operation. */
	static Msg subscribeToMailingList(String emailRaw, Request req) {
		String email = emailRaw.toLowerCase(Locale.US);
		Optional<AuthUser> authOpt = AuthUser.authOpt(req);
		if (authOpt.isPresent()) {
			if (!authOpt.get().email().equals(email)) {
				return Msg.titleBodyBtn("That's not you!",
						"You can't sign other people up for them, and you're already signed-in as " + authOpt.get().email,
						"Okay, I'll let them do it themselves.");
			}
		} else if (!isValidEmail(emailRaw)) {
			return invalidEmail(emailRaw);
		}
		DSLContext dsl = req.require(DSLContext.class);
		AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.EMAIL, email);
		if (account == null) {
			account = newAccount(email, req, dsl);
			return Msg.titleBodyBtn("Welcome aboard!",
					"We sent you an email with more details about what we're building together. Keep exploring and read it when you get a chance.",
					"Okay, I'll read it later.")
					.andSendLoginEmailTo(account, null);
		} else {
			account.setNewsletter(true);
			if (account.getConfirmedAt() != null) {
				return Msg.titleBodyBtn("We'll be in touch!",
						"You're signed up for our newsletter, and we'll keep you up to date on what we're building together.",
						"Okay, I look forward to it.")
						.andSendLoginEmailTo(account, null);

			} else {
				return Msg.titleBodyBtn("Check your email!",
						"We sent you a message to confirm that you want to hear from us. If you don't click the confirm link, you won't get our newsletter.",
						"Okay, I'll check my email.")
						.andSendLoginEmailTo(account, null);
			}
		}
	}

	private static boolean isValidEmail(String emailRaw) {
		return emailRaw.length() <= VarChars.EMAIL && forms.meta.Validator.isValidEmail(emailRaw);
	}

	private static Msg invalidEmail(String emailRaw) {
		if (emailRaw.length() > VarChars.EMAIL) {
			return Msg.titleBodyBtn("Invalid email",
					emailRaw + " is too long. Use an email with " + VarChars.EMAIL + " characters or less.",
					"Okay, I'll try again.");
		} else {
			return Msg.titleBodyBtn("Invalid email",
					emailRaw + " is not a valid email. Check the spelling.",
					"Okay, I'll try again.");
		}
	}

	private static AccountRecord newAccount(String email, Request req, DSLContext dsl) {
		LocalDateTime now = req.require(Time.class).now();
		String ip = Ip.get(req);

		AccountRecord account = dsl.newRecord(ACCOUNT);
		account.setEmail(email);
		account.setCreatedAt(now);
		account.setCreatedIp(ip);
		account.setUpdatedAt(now);
		account.setUpdatedIp(ip);
		account.setLastSeenAt(now);
		account.setLastSeenIp(ip);
		account.setLastEmailedAt(now);
		account.setNewsletter(true);
		account.insert();
		return account;
	}

	static class Msg {
		String title;
		String body;
		String btn;
		@Nullable
		AccountRecord sendLoginEmailTo;
		@Nullable
		String redirect;
		@Nullable
		AccountRecord loginCookieFor;

		static Msg titleBodyBtn(String title, String body, String btn) {
			Msg msg = new Msg();
			msg.title = title;
			msg.body = body;
			msg.btn = btn;
			return msg;
		}

		Msg andSendLoginEmailTo(AccountRecord sendLoginEmailTo, @Nullable LoginApi.Req login) {
			this.sendLoginEmailTo = sendLoginEmailTo;
			this.redirect = login != null ? login.redirect : null;
			return this;
		}

		Msg andLoginCookieFor(AccountRecord loginCookieFor) {
			this.loginCookieFor = loginCookieFor;
			return this;
		}

		Result toJsResult(Request req) {
			LoginApi.Res res = new LoginApi.Res();
			res.title = title;
			res.body = body;
			res.btn = btn;
			Result result = Results.ok(res);
			if (loginCookieFor != null) {
				result.header("Set-Cookie", AuthUser.login(loginCookieFor, req).stream()
						.map(Cookie::encode)
						.collect(Collectors.toList()));
			}
			toFormError(req);
			return result;
		}

		@Nullable
		String toFormError(Request req) {
			if (sendLoginEmailTo != null) {
				String htmlMsg;
				DSLContext dsl = req.require(DSLContext.class);
				LocalDateTime now = req.require(Time.class).now();
				LoginlinkRecord link = urlCode.createRecord(req, dsl, now, Ip.get(req));
				link.setExpiresAt(now.plus(EXPIRES_DAYS, ChronoUnit.DAYS));
				link.setAccountId(sendLoginEmailTo.getId());
				link.insert();
				UrlEncodedPath linkUrl = urlCode.recordToUrl(req, link);
				if (redirect != null && !redirect.isEmpty()) {
					linkUrl.param(REDIRECT, redirect);
				}
				// TODO: login vs newsletter dependent
				htmlMsg = views.Auth.loginEmail.template(sendLoginEmailTo.getEmail(), linkUrl.build()).renderToString();
				req.require(EmailSender.class).send(htmlEmail -> htmlEmail
						.setHtmlMsg(htmlMsg)
						.setSubject("Welcome to MyTake.org")
						.addTo(sendLoginEmailTo.getEmail()));
				return null;
			} else {
				return this.body;
			}
		}
	}

	static final int EXPIRES_DAYS = 7;

	static class Form<Self extends PostForm<Self>> extends PostForm<Self> {
		protected final String kind;
		protected final MetaField<String> emailField;

		protected Form(String kind, MetaField<String> emailField) {
			super(Routes.LOGIN, emailField, REDIRECT);
			this.kind = Objects.requireNonNull(kind);
			this.emailField = Objects.requireNonNull(emailField);
		}

		@Override
		protected FormValidation<Self> initialGet(Request req, Map<String, String> params) {
			return parseMetaFieldsSkipNulls(params)
					.keep(this.fields)
					.build();
		}

		@Override
		protected ValidateResult<Self> validate(Request req, Sensitive<Self> form) {
			LoginApi.Req login = new LoginApi.Req();
			login.email = Text.lowercase(form.value(emailField));
			login.kind = kind;
			login.redirect = form.value(REDIRECT);

			String error = Accounts.login(login, req).toFormError(req);
			if (error != null) {
				return form.keepAll().addError(emailField, error);
			} else {
				req.flash(AuthModule.FLASH_EMAIL, login.email);
				return ValidateResult.redirect(AuthModule.URL_confirm_login_sent);
			}
		}
	}

	public static class LoginForm extends Form<LoginForm> {
		public static final MetaField<String> EMAIL = MetaField.string("loginemail");

		public LoginForm() {
			super(KIND_LOGIN, EMAIL);
		}
	}

	public static class NewForm extends Form<NewForm> {
		public static final MetaField<String> EMAIL = MetaField.string("newemail");

		public NewForm() {
			super(KIND_USE, EMAIL);
		}
	}

	public static void confirm(Request req, Response rsp) throws Throwable {
		LocalDateTime now = req.require(Time.class).now();
		DSLContext dsl = req.require(DSLContext.class);
		LoginlinkRecord link = urlCode.tryGetRecord(req, dsl);
		String ip = Ip.get(req);
		String errorMsg;
		if (link == null || now.isAfter(link.getExpiresAt())) {
			errorMsg = "This link expired, try again.";
		} else if (link != null && !ip.equals(link.getRequestorIp())) {
			errorMsg = "Make sure to open the link from the same device you requested it from.";
		} else {
			errorMsg = null;
		}

		String redirect = URLDecoder.decode(req.param(REDIRECT.name()).value(HomeFeed.URL), "UTF-8");
		UrlEncodedPath path = UrlEncodedPath.path(Routes.LOGIN).param(REDIRECT, redirect);

		if (errorMsg != null) {
			// else we have no choice but to show an error
			req.flash("error", errorMsg);
			// and clear their login cookies
			AuthUser.clearCookies(req, rsp);
			if (req.param(LoginForm.EMAIL.name()).isSet()) {
				path.param(LoginForm.EMAIL, req.param(LoginForm.EMAIL.name()).value());
			}
			rsp.send(Results.redirect(path.build()));
			return;
		}

		// delete all login links for this account
		dsl.deleteFrom(LOGINLINK)
				.where(LOGINLINK.ACCOUNT_ID.eq(link.getAccountId()))
				.execute();
		// update the record's lastSeen
		AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.ID, link.getAccountId());
		account.setLastSeenIp(ip);
		account.setLastSeenAt(now);
		if (account.getConfirmedAt() == null) {
			account.setConfirmedIp(ip);
			account.setConfirmedAt(now);
		}
		account.update();
		// set the login cookies
		AuthUser.login(account, req).forEach(rsp::cookie);
		// redirect
		rsp.redirect(redirect);
	}

	static final UrlRandomCode<LoginlinkRecord> urlCode = new UrlRandomCode<>(AuthModule.URL_confirm_login, LOGINLINK.CODE, LOGINLINK.CREATED_AT, LOGINLINK.REQUESTOR_IP);
}
