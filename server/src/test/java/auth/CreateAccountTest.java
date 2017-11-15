/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static auth.AuthModule.CREATE_EMAIL;
import static auth.AuthModule.CREATE_USERNAME;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;

import common.EmailAssert;
import common.JoobyDevRule;
import common.PageAssert;
import db.tables.pojos.Account;
import forms.meta.MetaFormSubmit;
import javax.mail.MessagingException;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.Test;

public class CreateAccountTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.empty();

	@Test
	public void createAccount() throws MessagingException {
		// post the account form
		PageAssert.assertThat(MetaFormSubmit.create(CreateAccountForm.class)
				.set(CREATE_USERNAME, "alexander")
				.set(CREATE_EMAIL, "alexander@hamilton.com")
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
}
