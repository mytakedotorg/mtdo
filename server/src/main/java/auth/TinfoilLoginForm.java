/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
