/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import common.CustomAssets;
import common.DevTime;
import common.JoobyDevRule;
import db.tables.pojos.Account;
import io.restassured.specification.RequestSpecification;
import java.util.Optional;
import org.jooby.Jooby;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.Test;

public class AuthUserTest {
	static class App extends Jooby {
		{
			CustomAssets.initTemplates(this);
			use(new DevTime.Module());
			use(new AuthModule());
			get("/required", req -> {
				AuthUser user = AuthUser.auth(req);
				return user.username();
			});
			get("/optional", req -> {
				Optional<AuthUser> userOpt = AuthUser.authOpt(req);
				if (userOpt.isPresent()) {
					return userOpt.get().username();
				} else {
					return "not logged in";
				}
			});
		}
	}

	@ClassRule
	public static JoobyDevRule app = new JoobyDevRule(new App());

	private static RequestSpecification givenUser(String username) {
		Account account = new Account();
		account.setId(-1); // not used
		account.setUsername(username);
		account.setEmail("unused@email.com");
		return AuthModuleHarness.givenUser(app.app(), account);
	}

	@Test
	public void required() {
		givenUser("rick").get("/required").then()
				.statusCode(Status.OK.value())
				.body(equalTo("rick"));
		givenUser("morty").get("/required").then()
				.statusCode(Status.OK.value())
				.body(equalTo("morty"));
		given().redirects().follow(false).get("/required").then()
				.statusCode(Status.TEMPORARY_REDIRECT.value())
				.header("Location", "/login?redirect=%2Frequired&loginreason=We+can+show+that+to+you+after+you+log+in.");
	}

	@Test
	public void optional() {
		givenUser("rick").get("/optional").then()
				.statusCode(Status.OK.value())
				.body(equalTo("rick"));
		givenUser("morty").get("/optional").then()
				.statusCode(Status.OK.value())
				.body(equalTo("morty"));
		given().get("/optional").then()
				.statusCode(Status.OK.value())
				.body(equalTo("not logged in"));
	}
}
