/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package auth;

import static auth.AuthModule.ACCEPT_TERMS;
import static auth.AuthModule.CREATE_EMAIL;
import static auth.AuthModule.CREATE_USERNAME;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;

import common.EmailAssert;
import common.JoobyDevRule;
import common.PageAssert;
import common.UrlEncodedPath;
import db.tables.pojos.Account;
import forms.meta.MetaFormSubmit;
import io.restassured.RestAssured;
import java.util.Collections;
import javax.mail.MessagingException;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class CreateAccountTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialDataNoMods();

	@Test
	public void _01_createAccount() throws MessagingException {
		// post the account form
		PageAssert.assertThat(MetaFormSubmit.create(CreateAccountForm.class)
				.set(CREATE_USERNAME, "alexander")
				.set(CREATE_EMAIL, "alexander@hamilton.com")
				.set(ACCEPT_TERMS, true)
				.set(REDIRECT, "")
				.post("/login"), Status.OK)
				.bodyAssert(asserter -> {
					asserter.contains("A confirmation email has been sent");
				});

		// check the email, and grab the confirmation link
		EmailAssert confirmationEmail = dev.waitForEmail();
		confirmationEmail.subject().isEqualTo("MyTake.org account confirmation");
		confirmationEmail.body().contains("Welcome to MyTake.org, alexander!");
		String link = confirmationEmail.extractLink("Visit the ");

		// click the link
		PageAssert.assertThatGet(link, Status.OK)
				// it should have login cookies
				.responseAssert(response -> {
					Account account = dev.fetchRecord(ACCOUNT, ACCOUNT.USERNAME, "alexander").into(Account.class);
					response.cookie(AuthUser.LOGIN_COOKIE, AuthUser.jwtToken(dev.app(), account));
				})
				// and the right message
				.bodyAssert(body -> {
					body.contains("Thanks for confirming your account, alexander.");
				});
	}

	@Test
	public void _02_doubleConfirmLoggedInSameUser() throws MessagingException {
		EmailAssert confirmationEmail = dev.waitForEmail();
		String link = confirmationEmail.extractLink("Visit the ");

		PageAssert.assertThat(dev.givenUser("alexander").get(link), Status.OK)
				// no change to cookies
				.responseAssert(response -> {
					response.cookies(Collections.emptyMap());
				})
				// and the right message 
				.bodyAssert(body -> {
					body.contains("account has already been confirmed, and you are logged in.");
				});
	}

	@Test
	public void _03_doubleConfirmNotLoggedIn() throws MessagingException {
		EmailAssert confirmationEmail = dev.waitForEmail();
		String link = confirmationEmail.extractLink("Visit the ");

		PageAssert.assertThat(RestAssured.given()
				.redirects().follow(false)
				.get(link), Status.FOUND)
				// it should remove the login cookie
				.responseAssert(response -> {
					String redirect = UrlEncodedPath.path("/login")
							.param(AuthModule.LOGIN_EMAIL, "alexander@hamilton.com")
							.param(AuthModule.LOGIN_REASON, "Your account is already confirmed, you can login.")
							.build();
					response.header("Location", redirect);
				});
	}
}
