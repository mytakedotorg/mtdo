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
import common.Snapshot;
import forms.meta.FormSubmit;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import java2ts.LoginApi;
import java2ts.Routes;
import org.assertj.core.api.Assertions;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class UsernameFormTest {
	@ClassRule
	public static JoobyDevRule app = JoobyDevRule.initialData();

	private static RequestSpecification noRedirects() {
		return RestAssured.given().redirects().follow(false);
	}

	@Test
	public void _01_anonUsername() {
		noRedirects().get(Routes.USERNAME)
				.then()
				.statusCode(Status.TEMPORARY_REDIRECT.value())
				.header("Location", "/login?redirect=%2Fusername&loginreason=We+can+show+that+to+you+after+you+log+in.");
	}

	@Test
	public void _02_unconfirmedUsername() {
		Map<String, String> cookiesUnconfirmed;
		{
			LoginApi.Req req = new LoginApi.Req();
			req.email = "test@email.com";
			req.kind = "use";
			cookiesUnconfirmed = RestAssured.given().contentType(ContentType.JSON)
					.body(req.toJson())
					.post(Routes.API_LOGIN)
					.then()
					.extract().cookies();
		}
		Snapshot.match("unconfirmed", RestAssured.given().redirects().follow(false).cookies(cookiesUnconfirmed).get(Routes.USERNAME))
				.contains("You must first confirm your email address. Check your email!")
				.contains("class=\"form__error\"");
	}

	@Test
	public void _03_confirmedUsername() {
		String loginLink = app.waitForEmails(1).get("test@email.com")
				.extractLink("Visit ");
		Map<String, String> cookiesNoUsername = noRedirects().get(loginLink)
				.then()
				.statusCode(Status.FOUND.value())
				.extract().cookies();
		Snapshot.match("confirmed", noRedirects().cookies(cookiesNoUsername).get(Routes.USERNAME))
				.doesNotContain("class=\"form__error\"");

		Map<String, String> cookiesUsername = FormSubmit.create(UsernameForm.class)
				.set(UsernameForm.USERNAME, "tester")
				.set(UsernameForm.ACCEPT_TERMS, true)
				.set(AuthModule.REDIRECT, "/")
				.postDebugWithCookies(cookiesNoUsername)
				.then()
				.statusCode(Status.SEE_OTHER.value())
				.extract().cookies();

		Assertions.assertThat(cookiesNoUsername.get("loginui")).isEqualTo("\"{\\\"username\\\":null,\\\"email\\\":\\\"test@email.com\\\",\\\"unconfirmed\\\":false}\"");
		Assertions.assertThat(cookiesUsername.get("loginui")).isEqualTo("\"{\\\"username\\\":\\\"tester\\\",\\\"email\\\":\\\"test@email.com\\\",\\\"unconfirmed\\\":false}\"");
	}

	/** Creates and confirms an account at the given email address, and returns their login cookies. */
	private Map<String, String> createAndConfirm(String email) {
		LoginApi.Req req = new LoginApi.Req();
		req.email = email;
		req.kind = "use";
		RestAssured.given().contentType(ContentType.JSON)
				.body(req.toJson())
				.post(Routes.API_LOGIN);
		String loginLink = app.waitForEmails(1).get(email)
				.extractLink("Visit ");
		return noRedirects().get(loginLink)
				.then()
				.statusCode(Status.FOUND.value())
				.extract().cookies();
	}

	@Test
	public void _04_mustAcceptTerms() {
		Map<String, String> cookies = createAndConfirm("blub@email.com");
		Snapshot.match("must-accept-terms", FormSubmit.create(UsernameForm.class)
				.set(UsernameForm.USERNAME, "blub")
				.set(UsernameForm.ACCEPT_TERMS, false)
				.set(AuthModule.REDIRECT, "/")
				.post(noRedirects().cookies(cookies))).contains("Must accept the terms to claim a username");
	}

	@Test
	public void _05_typoharden() {
		Map<String, String> cookies = createAndConfirm("blub@email.com");
		Snapshot.match("typoharden-taken", FormSubmit.create(UsernameForm.class)
				.set(UsernameForm.USERNAME, "tester")
				.set(UsernameForm.ACCEPT_TERMS, true)
				.set(AuthModule.REDIRECT, "/")
				.post(noRedirects().cookies(cookies))).contains("Already taken");
		Snapshot.match("typoharden", FormSubmit.create(UsernameForm.class)
				.set(UsernameForm.USERNAME, "teesterr")
				.set(UsernameForm.ACCEPT_TERMS, true)
				.set(AuthModule.REDIRECT, "/")
				.post(noRedirects().cookies(cookies))).contains("Too similar to existing user tester");
	}
}
