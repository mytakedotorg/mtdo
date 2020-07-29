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

import forms.api.FormValidation;
import forms.meta.TypedFormDef;
import javax.annotation.Nullable;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class CreateAccountFormTest {
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

	private void usernameCase(String username, @Nullable String error) {
		FormValidation.Sensitive<CreateAccountForm> sensitive = FormValidation.emptySensitive(TypedFormDef.create(CreateAccountForm.class))
				.set(AuthModule.CREATE_USERNAME, username)
				.set(AuthModule.CREATE_EMAIL, "name@email.com")
				.set(AuthModule.ACCEPT_TERMS, true)
				.set(AuthModule.REDIRECT, "");
		FormValidation.Builder<CreateAccountForm> retry = sensitive.keepAll();
		CreateAccountForm.validateUsernameFormat(username, retry);
		if (error == null) {
			Assertions.assertThat(retry.builder().noErrors()).isTrue();
		} else {
			String actualError = retry.builder().build().errors().values().stream()
					.filter(value -> value != null)
					.findAny().get();
			Assertions.assertThat(actualError).isEqualTo(error);
		}
	}
}
