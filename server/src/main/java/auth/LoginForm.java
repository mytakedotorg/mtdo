/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static db.Tables.ACCOUNT;
import static db.Tables.LOGINLINK;

import com.google.common.collect.ImmutableSet;
import common.RandomString;
import common.Time;
import common.UrlEncodedPath;
import db.VarChars;
import db.tables.records.LoginlinkRecord;
import forms.meta.MetaField;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.jooby.Request;
import org.jooby.Response;
import org.jooq.DSLContext;

public class LoginForm extends MetaFormDef.HandleValid {
	public static final int EXPIRES_MINUTES = 10;

	public static final MetaField<String> USERNAME = MetaField.string("login-user");
	public static final MetaField<String> REDIRECT = MetaField.string("redirect");

	@Override
	public Set<MetaField<?>> fields() {
		return ImmutableSet.of(USERNAME, REDIRECT);
	}

	@Override
	protected void validate(MetaFormValidation validation) {
		validation.keepAll();
		CreateAccountForm.validateUsername(validation, USERNAME);
	}

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String username = validation.parsed(USERNAME);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			Integer accountId = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.USERNAME.eq(username))
					.fetchOne(ACCOUNT.ID);
			if (accountId == null) {
				validation.errorForField(USERNAME, "No such user");
				return false;
			} else {
				String code = RandomString.get(req.require(Random.class), VarChars.CODE);

				LoginlinkRecord login = dsl.newRecord(LOGINLINK);
				login.setCode(code);
				Time time = req.require(Time.class);
				login.setCreatedAt(time.nowTimestamp());
				login.setExpiresAt(time.nowTimestamp().plus(EXPIRES_MINUTES, TimeUnit.MINUTES));
				login.setRequestorIp(req.ip());
				login.setAccountId(accountId);
				login.insert();

				UrlEncodedPath path = UrlEncodedPath.absolutePath(req, AuthModule.URL_confirm_login + code);
				path.copyIfPresent(req, AuthModule.LOGIN_PARAM_ORIGINAL);
				rsp.send(views.Auth.emailLogin.template(username, path.build()));
				return true;
			}
		}
	}
}
