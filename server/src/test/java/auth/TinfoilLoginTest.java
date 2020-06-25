/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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

import com.auth0.jwt.algorithms.Algorithm;
import common.JoobyDevRule;
import forms.meta.MetaFormSubmit;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.Test;

public class TinfoilLoginTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void correctWorks() {
		String loginCookie = AuthModuleHarness.authTokenValue(dev, "samples");
		MetaFormSubmit.create(TinfoilLoginForm.class)
				.set(TinfoilLoginForm.USERNAME, "samples")
				.set(TinfoilLoginForm.PASSWORD, "Ijk07hx8GrfgJV6b3q+FxXY8zUvBl88VzIG0PPQ32Jc=")
				.post(TinfoilLoginForm.URL)
				.then()
				.statusCode(Status.FOUND.value())
				.cookie(AuthUser.LOGIN_COOKIE, loginCookie);
	}

	@Test
	public void incorrectBroken() {
		MetaFormSubmit.create(TinfoilLoginForm.class)
				.set(TinfoilLoginForm.USERNAME, "samples")
				.set(TinfoilLoginForm.PASSWORD, "Ijk07hx8GrfgJV6b3q+FxXY8zUvBl88VzIG0PPQ32Jc=E")
				.post(TinfoilLoginForm.URL)
				.then()
				.cookies(Collections.emptyMap());
	}

	public static void main(String[] args) throws Exception {
		// dev secret, so not really secret
		String secret = "4SyTwj2g973mM4vdcOi7SDl96JzOaSw1nPPJtBco";
		String username = "samples";
		String email = "samples@email.com";
		Algorithm algorithm = Algorithm.HMAC256(secret);
		byte[] content = (username + "|" + email).getBytes(StandardCharsets.UTF_8);
		byte[] signature = algorithm.sign(content);
		String password = Base64.getEncoder().encodeToString(signature);
		System.out.println(password);
	}
}
