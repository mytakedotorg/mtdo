/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static auth.AuthModule.LOGIN_EMAIL;
import static auth.AuthModule.REDIRECT;

import com.google.common.collect.ImmutableMap;
import common.EmailAssert;
import common.JoobyDevRule;
import common.PageAssert;
import forms.meta.MetaFormSubmit;
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
		PageAssert.assertThat(MetaFormSubmit.create(LoginForm.class)
				.set(REDIRECT, "/redirectTarget")
				.set(LOGIN_EMAIL, "samples@email.com")
				.post("/login"), Status.OK)
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
