/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package auth;

import static db.Tables.ACCOUNT;

import com.auth0.jwt.algorithms.Algorithm;
import com.google.common.collect.ImmutableSet;
import controllers.HomeFeed;
import db.tables.pojos.Account;
import db.tables.records.AccountRecord;
import forms.meta.MetaField;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Set;
import java2ts.Routes;
import org.jooby.Request;
import org.jooby.Response;
import org.jooby.Status;
import org.jooq.DSLContext;

public class TinfoilLoginForm extends MetaFormDef.HandleValid {
	static final String URL = Routes.API + "/tinfoilLogin";

	public static final MetaField<String> USERNAME = MetaField.string("tinfoil-username");
	public static final MetaField<String> PASSWORD = MetaField.string("tinfoil-password");

	@Override
	public Set<MetaField<?>> fields() {
		return ImmutableSet.of(USERNAME, PASSWORD);
	}

	@Override
	protected void validate(MetaFormValidation validation) {}

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String username = validation.parsed(USERNAME);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			AccountRecord accountRecord = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.USERNAME.eq(username))
					.fetchOne();
			if (accountRecord == null) {
				rsp.send(Status.BAD_REQUEST);
			}
			Account account = accountRecord.into(Account.class);
			Algorithm algorithm = req.require(Algorithm.class);
			byte[] content = (username + "|" + account.getEmail()).getBytes(StandardCharsets.UTF_8);
			byte[] signature = algorithm.sign(content);
			String password = Base64.getEncoder().encodeToString(signature);
			if (validation.parsed(PASSWORD).equals(password)) {
				AuthUser.login(account, req, rsp);
				rsp.redirect(HomeFeed.URL);
			} else {
				rsp.send(Status.BAD_REQUEST);
			}
		}
		return false;
	}
}
