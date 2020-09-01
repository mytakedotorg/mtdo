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

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

import common.CustomAssets;
import common.DevTime;
import common.JoobyDevRule;
import db.tables.records.AccountRecord;
import io.restassured.specification.RequestSpecification;

import java.time.LocalDateTime;
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
		AccountRecord account = new AccountRecord();
		account.setId(-1); // not used
		account.setUsername(username);
		account.setEmail("unused@email.com");
		account.setConfirmedAt(LocalDateTime.of(2000, 1, 1, 0, 0));
		account.setConfirmedIp("127.0.0.1");
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
