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
import forms.meta.FormSubmit;
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

	private static String link;

	@Test
	public void _01_createAccount() throws MessagingException {
		// post the account form
		PageAssert.assertThat(FormSubmit.create(CreateAccountForm.class)
				.set(CREATE_USERNAME, "alexander")
				.set(CREATE_EMAIL, "alexander@hamilton.com")
				.set(ACCEPT_TERMS, true)
				.set(REDIRECT, "")
				.post(), Status.OK)
				.bodyAssert(asserter -> {
					asserter.contains("A confirmation email has been sent");
				});

		// check the email, and grab the confirmation link
		EmailAssert confirmationEmail = dev.waitForEmail();
		confirmationEmail.subject().isEqualTo("MyTake.org account confirmation");
		confirmationEmail.body().contains("Welcome to MyTake.org, alexander!");
		link = confirmationEmail.extractLink("Visit the ");

		// click the link
		PageAssert.assertThat(RestAssured.given().urlEncodingEnabled(false).redirects().follow(false).get(link), Status.OK)
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
		PageAssert.assertThat(RestAssured.given()
				.redirects().follow(false).urlEncodingEnabled(false)
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
