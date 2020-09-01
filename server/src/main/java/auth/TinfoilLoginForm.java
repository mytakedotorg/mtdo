/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import common.RedirectException;
import controllers.HomeFeed;
import db.tables.records.AccountRecord;
import forms.api.FormValidation.Sensitive;
import forms.meta.MetaField;
import forms.meta.PostForm;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java2ts.Routes;
import org.jooby.Request;
import org.jooq.DSLContext;

public class TinfoilLoginForm extends PostForm<TinfoilLoginForm> {
	static final String URL = Routes.API + "/tinfoilLogin";

	public static final MetaField<String> USERNAME = MetaField.string("tinfoil-username");
	public static final MetaField<String> PASSWORD = MetaField.string("tinfoil-password");

	public TinfoilLoginForm() {
		super(URL, USERNAME, PASSWORD);
	}

	@Override
	protected ValidateResult<TinfoilLoginForm> validate(Request req, Sensitive<TinfoilLoginForm> fromUser) {
		String username = fromUser.value(USERNAME);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			AccountRecord account = dsl.selectFrom(ACCOUNT)
					.where(ACCOUNT.USERNAME.eq(username))
					.fetchOne();
			if (account == null) {
				throw RedirectException.notFoundError();
			}
			Algorithm algorithm = req.require(Algorithm.class);
			byte[] content = (username + "|" + account.getEmail()).getBytes(StandardCharsets.UTF_8);
			@SuppressWarnings("deprecation")
			byte[] signature = algorithm.sign(content);
			String password = Base64.getEncoder().encodeToString(signature);
			if (fromUser.value(PASSWORD).equals(password)) {
				return ValidateResult.redirect(HomeFeed.URL, AuthUser.login(account, req));
			} else {
				throw RedirectException.notFoundError();
			}
		}
	}
}
