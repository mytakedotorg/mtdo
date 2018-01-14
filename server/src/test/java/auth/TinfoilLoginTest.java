/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
