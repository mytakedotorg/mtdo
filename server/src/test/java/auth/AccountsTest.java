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

import common.JoobyDevRule;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java2ts.LoginApi;
import java2ts.Routes;
import org.assertj.core.api.Assertions;
import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.Matchers;
import org.junit.ClassRule;
import org.junit.Test;

public class AccountsTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void unconfirmedUserTest() {
		LoginApi.Req req = new LoginApi.Req();
		req.email = "george@mtvernon.com";
		req.kind = "use";
		RestAssured.given().contentType(ContentType.JSON).body(req.toJson()).post(Routes.API_LOGIN)
				.then()
				.contentType(ContentType.JSON)
				.body("title", Matchers.is("Welcome aboard!"),
						"body", Matchers.is("We sent you an email with more details about what we're building together. Keep exploring and read it when you get a chance."),
						"btn", Matchers.is("Okay, I'll read it later."))
				.header("Set-Cookie", contains("{\\\"username\\\":null,\\\"email\\\":\\\"george@mtvernon.com\\\",\\\"unconfirmed\\\":true}"));
	}

	private static Matcher<Object> contains(String sub) {
		return new BaseMatcher<Object>() {
			@Override
			public boolean matches(Object actual) {
				Assertions.assertThat(actual.toString()).contains(sub);
				return true;
			}

			@Override
			public void describeTo(Description description) {

			}
		};
	}
}
