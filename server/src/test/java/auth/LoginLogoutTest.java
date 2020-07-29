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

import com.google.common.collect.ImmutableMap;
import common.EmailAssert;
import common.JoobyDevRule;
import common.PageAssert;
import forms.meta.FormSubmit;
import io.restassured.RestAssured;
import javax.mail.MessagingException;
import org.assertj.core.api.Assertions;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.Test;

public class LoginLogoutTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void login() throws MessagingException {
		PageAssert.assertThat(FormSubmit.create(LoginForm.class)
				.set(REDIRECT, "/redirectTarget")
				.set(LOGIN_EMAIL, "samples@email.com")
				.post(), Status.OK)
				.bodyAssert(asserter -> {
					asserter.contains("A login email has been sent to samples@email.com");
				}).responseAssert(response -> {
					// no cookies
					Assertions.assertThat(response.extract().cookies().keySet()).isEmpty();
				});

		EmailAssert loginEmail = dev.waitForEmail();
		loginEmail.subject().isEqualTo("MyTake.org login link");
		loginEmail.body().contains("Welcome back to MyTake.org, samples!");
		String link = loginEmail.extractLink("Visit ");

		String loginCookie = AuthModuleHarness.authTokenValue(dev, "samples");
		RestAssured.given()
				.redirects().follow(false)
				.get(link)
				.then()
				.statusCode(Status.FOUND.value())
				.cookie(AuthUser.LOGIN_COOKIE, loginCookie)
				.header("Location", "%2FredirectTarget");
	}

	@Test
	public void logout() throws MessagingException {
		String loginCookie = AuthModuleHarness.authTokenValue(dev, "samples");
		RestAssured.given()
				.redirects().follow(false)
				.cookie(AuthUser.LOGIN_COOKIE, loginCookie)
				.get("/logout")
				.then()
				.cookies(ImmutableMap.of())
				.header("Location", "/");
	}
}
