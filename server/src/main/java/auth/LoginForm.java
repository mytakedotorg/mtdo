/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static auth.AuthModule.LOGIN_EMAIL;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;
import static db.Tables.LOGINLINK;

import com.google.common.collect.ImmutableSet;
import common.Emails;
import common.RandomString;
import common.Text;
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
		return ImmutableSet.of(LOGIN_EMAIL, REDIRECT);
	}

	@Override
	protected void validate(MetaFormValidation validation) {
		validation.keepAll();
	}

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String email = Text.lowercase(validation.parsed(LOGIN_EMAIL));
		String from = Emails.FEEDBACK;
		try (DSLContext dsl = req.require(DSLContext.class)) {
			AccountRecord account = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.EMAIL.eq(email))
					.fetchOne();
			if (account == null) {
				validation.errorForField(LOGIN_EMAIL, "No account for this email");
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

				UrlEncodedPath path = EmailConfirmationForm.generateLink(req, validation, AuthModule.URL_confirm_login + code);
				path.param(LOGIN_EMAIL, email);

				String html = views.Auth.loginEmail.template(account.getUsername(), path.build()).renderToString();
				req.require(HtmlEmail.class)
						.setHtmlMsg(html)
						.setSubject("MyTake.org login link")
						.addTo(email)
						.setFrom(from)
						.send();

				account.setLastEmailedAt(time.nowTimestamp());
				account.update();

				rsp.send(views.Auth.loginEmailSent.template(email, from));
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
			MetaFormValidation validation = EmailConfirmationForm.validate(LoginForm.class, req, link,
					LoginlinkRecord::getExpiresAt, LoginlinkRecord::getRequestorIp);
			if (validation != null) {
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
