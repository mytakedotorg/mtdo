/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static auth.AuthModule.LOGIN_USERNAME;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;
import static db.Tables.LOGINLINK;

import com.google.common.collect.ImmutableSet;
import common.Emails;
import common.RandomString;
import common.Time;
import common.UrlEncodedPath;
import controllers.HomeFeed;
import db.VarChars;
import db.tables.pojos.Account;
import db.tables.records.AccountRecord;
import db.tables.records.LoginlinkRecord;
import forms.meta.MetaField;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.apache.commons.mail.HtmlEmail;
import org.jooby.Mutant;
import org.jooby.Request;
import org.jooby.Response;
import org.jooby.Results;
import org.jooq.DSLContext;

public class LoginForm extends MetaFormDef.HandleValid {
	public static final int EXPIRES_MINUTES = 10;

	@Override
	public Set<MetaField<?>> fields() {
		return ImmutableSet.of(LOGIN_USERNAME, REDIRECT);
	}

	@Override
	protected void validate(MetaFormValidation validation) {
		validation.keepAll();
		CreateAccountForm.validateUsername(validation, LOGIN_USERNAME);
	}

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String username = validation.parsed(LOGIN_USERNAME);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			AccountRecord account = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.USERNAME.eq(username))
					.fetchOne();
			if (account == null) {
				validation.errorForField(LOGIN_USERNAME, "No such user");
				return false;
			} else {
				String code = RandomString.get(req.require(Random.class), VarChars.CODE);

				LoginlinkRecord login = dsl.newRecord(LOGINLINK);
				login.setCode(code);
				Time time = req.require(Time.class);
				login.setCreatedAt(time.nowTimestamp());
				login.setExpiresAt(time.nowTimestamp().plus(EXPIRES_MINUTES, TimeUnit.MINUTES));
				login.setRequestorIp(req.ip());
				login.setAccountId(account.getId());
				login.insert();

				UrlEncodedPath path = UrlEncodedPath.absolutePath(req, AuthModule.URL_confirm_login + code);
				String redirect = validation.parsed(REDIRECT);
				if (!redirect.isEmpty()) {
					path.param(REDIRECT, redirect);
				}
				path.param(LOGIN_USERNAME, username);

				String html = views.Auth.emailLogin.template(username, path.build()).renderToString();
				req.require(HtmlEmail.class)
						.setHtmlMsg(html)
						.setSubject("MyTake.org login link")
						.addTo(account.getEmail())
						.setFrom(Emails.FEEDBACK)
						.send();

				account.setLastEmailedAt(time.nowTimestamp());
				account.update();

				rsp.send(views.Auth.emailLogin.template(username, path.build()));
				return true;
			}
		}
	}

	public static void confirm(String code, Request req, Response rsp) throws Throwable {
		Time time = req.require(Time.class);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			LoginlinkRecord link = dsl.selectFrom(LOGINLINK)
					.where(LOGINLINK.CODE.eq(code))
					.fetchOne();
			if (link == null
					|| time.nowTimestamp().after(link.getExpiresAt())
					|| !link.getRequestorIp().equals(req.ip())) {
				MetaFormValidation validation = MetaFormValidation.empty(CreateAccountForm.class)
						.initAllIfPresent(req);
				if (link == null || time.nowTimestamp().after(link.getExpiresAt())) {
					validation.errorForForm("This link expired");
				} else if (!link.getRequestorIp().equals(req.ip())) {
					validation.errorForForm("Make sure to open the link from the same computer you requested it from");
				}
				// show a "try again" login form
				rsp.send(views.Auth.loginUnknown.template(validation.markup(AuthModule.URL_login)));
			} else {
				// delete all login links for this account
				dsl.deleteFrom(LOGINLINK)
						.where(LOGINLINK.ACCOUNT_ID.eq(link.getAccountId()))
						.execute();
				// update the record's lastSeen
				AccountRecord account = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.ID.eq(link.getAccountId()))
						.fetchOne();
				account.setLastSeenIp(req.ip());
				account.setLastSeenAt(time.nowTimestamp());
				account.update();
				// set the login cookies
				AuthUser.login(account.into(Account.class), req, rsp);
				// redirect 
				Mutant redirect = req.param(REDIRECT.name());
				rsp.send(Results.redirect(redirect.value(HomeFeed.URL)));
			}
		}
	}
}
