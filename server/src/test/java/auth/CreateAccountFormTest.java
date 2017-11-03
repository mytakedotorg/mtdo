/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import forms.meta.MetaFormValidationAssert;
import org.junit.Test;

public class CreateAccountFormTest {
	@Test
	public void allFieldsBroken() {
		MetaFormValidationAssert.assertThat(CreateAccountForm.class,
				"username", "a",
				"email", "nope")
				.hasFieldErrors(
						"username", "Must be at least 5 characters long",
						"email", "Invalid email");
	}

	@Test
	public void usernameValidation() {
		usernameCase("", "Must be at least 5 characters long");
		usernameCase("1234", "Must be at least 5 characters long");
		usernameCase("12345", null);
		usernameCase("012345678901234567890123456789012345678901234567890", "Must be no longer than 50 characters");
		usernameCase("01234567890123456789012345678901234567890123456789", null);
		usernameCase("RickSanchez", "Can only use lowercase letters, numbers, and '-'");
		usernameCase("ricksanchez", null);
		usernameCase("rick-sanchez", null);
		usernameCase("rick_sanchez", "Can only use lowercase letters, numbers, and '-'");
	}

	private void usernameCase(String username, String error) {
		MetaFormValidationAssert assertion = MetaFormValidationAssert.assertThat(CreateAccountForm.class,
				"username", username,
				"email", "name@email.com");
		if (error == null) {
			assertion.noError();
		} else {
			assertion.hasFieldErrors("username", error);
		}
	}
}
