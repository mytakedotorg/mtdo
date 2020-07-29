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

import static auth.AuthModule.LOGIN_EMAIL;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;
import static db.Tables.LOGINLINK;

import common.DbMisc;
import common.EmailSender;
import common.IpGetter;
import common.Text;
import common.Time;
import common.UrlEncodedPath;
import common.UrlRandomCode;
import controllers.HomeFeed;
import db.tables.pojos.Account;
import db.tables.records.AccountRecord;
import db.tables.records.LoginlinkRecord;
import forms.api.FormValidation;
import forms.meta.PostForm;
import forms.meta.Validator;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java2ts.Routes;
import org.jooby.Mutant;
import org.jooby.Request;
import org.jooby.Response;
import org.jooby.Results;
import org.jooq.DSLContext;

public class LoginForm extends PostForm<LoginForm> {
	public LoginForm() {
		super(Routes.LOGIN, LOGIN_EMAIL, REDIRECT);
	}

	public static final int EXPIRES_MINUTES = 10;

	/** Populates the initial values for the given form. */
	@Override
	protected FormValidation<LoginForm> initialGet(Request req, Map<String, String> params) {
		return parseMetaFieldsSkipNulls(params)
				.keep(LOGIN_EMAIL, REDIRECT)
				.build();
	}

	@Override
	protected ValidateResult<LoginForm> validate(Request req, FormValidation.Sensitive<LoginForm> form) {
		String email = Text.lowercase(form.value(LOGIN_EMAIL));
		FormValidation.Builder<LoginForm> retry = form.keepAll();
		Validator.email().validate(form, LOGIN_EMAIL);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.EMAIL, email);
			if (account == null) {
				return retry.addError(LOGIN_EMAIL, "No account for this email");
			} else {
				Time.AddableTimestamp now = req.require(Time.class).nowTimestamp();
				String ip = req.require(IpGetter.class).ip(req);

				LoginlinkRecord login = urlCode.createRecord(req, dsl, now, ip);
				login.setExpiresAt(now.plus(EXPIRES_MINUTES, TimeUnit.MINUTES));
				login.setAccountId(account.getId());
				login.insert();

				UrlEncodedPath path = urlCode.recordToUrl(req, login);
				if (form.valuePresent(REDIRECT)) {
					path.param(REDIRECT, form.value(REDIRECT));
				}
				path.param(LOGIN_EMAIL, email);

				req.require(EmailSender.class).send(htmlEmail -> htmlEmail
						.setHtmlMsg(views.Auth.loginEmail.template(account.getUsername(), path.build()).renderToString())
						.setSubject("MyTake.org login link")
						.addTo(email));

				account.setLastEmailedAt(now);
				account.update();

				req.flash(AuthModule.FLASH_EMAIL, form.value(LOGIN_EMAIL));
				return ValidateResult.redirect(AuthModule.URL_confirm_login_sent);
			}
		}
	}

	public static void confirm(Request req, Response rsp) throws Throwable {
		Time.AddableTimestamp now = req.require(Time.class).nowTimestamp();
		try (DSLContext dsl = req.require(DSLContext.class)) {
			LoginlinkRecord link = urlCode.tryGetRecord(req, dsl);
			String ip = req.require(IpGetter.class).ip(req);
			String errorMsg;
			if (link == null || now.after(link.getExpiresAt())) {
				errorMsg = "This link expired, try again.";
			} else if (link != null && ip.equals(link.getRequestorIp())) {
				errorMsg = "Make sure to open the link from the same device you requested it from.";
			} else {
				errorMsg = null;
			}

			if (errorMsg != null) {
				// else we have no choice but to show an error
				req.flash("error", errorMsg);
				// and clear their login cookies
				AuthUser.clearCookies(rsp);
				UrlEncodedPath path = UrlEncodedPath.path(Routes.LOGIN);
				if (req.param(LOGIN_EMAIL.name()).isSet()) {
					path.param(LOGIN_EMAIL, req.param(LOGIN_EMAIL.name()).value());
				}
				if (req.param(REDIRECT.name()).isSet()) {
					path.param(REDIRECT, req.param(REDIRECT.name()).value());
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
			account.update();
			// set the login cookies
			AuthUser.login(account.into(Account.class), req).forEach(rsp::cookie);
			// redirect 
			Mutant redirect = req.param(REDIRECT.name());
			if (redirect.isSet()) {
				rsp.redirect(redirect.value());
			} else {
				rsp.redirect(HomeFeed.URL);
			}
		}
	}

	static final UrlRandomCode<LoginlinkRecord> urlCode = new UrlRandomCode<>(AuthModule.URL_confirm_login, LOGINLINK.CODE, LOGINLINK.CREATED_AT, LOGINLINK.REQUESTOR_IP);
}
