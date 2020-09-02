/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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

import common.JoobyDevRule;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java.util.Map;
import java2ts.LoginApi;
import java2ts.Routes;
import javax.ws.rs.core.Response.Status;
import org.hamcrest.Matchers;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class UnconfirmedUserStory {
	@ClassRule
	public static JoobyDevRule app = JoobyDevRule.initialData();

	private static Map<String, String> cookiesUnconfirmed;
	private static Map<String, String> cookiesConfirmed;

	@Test
	public void _01_createUnconfirmed() {
		LoginApi.Req req = new LoginApi.Req();
		req.email = "test@email.com";
		req.kind = "use";
		cookiesUnconfirmed = RestAssured.given().contentType(ContentType.JSON)
				.body(req.toJson())
				.post(Routes.API_LOGIN)
				.then()
				.body("title", Matchers.is("Welcome aboard!"),
						"body", Matchers.is("We sent you an email with more details about what we're building together. Keep exploring and read it when you get a chance."),
						"btn", Matchers.is("Okay, I'll read it later."))
				.extract().cookies();
	}

	@Test
	public void _02_useUnconfirmed() {
		// broken without login
		RestAssured.given().get(Routes.API_BOOKMARKS)
				.then()
				.statusCode(Status.FORBIDDEN.getStatusCode())
				.body(Matchers.is("We can show that to you after you log in."));
		// works with login
		RestAssured.given().cookies(cookiesUnconfirmed).get(Routes.API_BOOKMARKS)
				.then()
				.statusCode(Status.OK.getStatusCode())
				.body(Matchers.is("[]"));
	}

	@Test
	public void _03_nowConfirm() {
		String loginLink = app.waitForEmails(1).get("test@email.com")
				.extractLink("Visit ");
		cookiesConfirmed = RestAssured.given().redirects().follow(false).get(loginLink)
				.then()
				.statusCode(Status.FOUND.getStatusCode())
				.extract().cookies();
	}

	@Test
	public void _04_unconfirmedBroken() {
		// unconfirmed login
		RestAssured.given().cookies(cookiesUnconfirmed).get(Routes.API_BOOKMARKS)
				.then()
				.statusCode(Status.FORBIDDEN.getStatusCode())
				.body(Matchers.is("Your login timed out."));
	}

	@Test
	public void _05_confirmedWorks() {
		// unconfirmed login
		RestAssured.given().cookies(cookiesConfirmed).get(Routes.API_BOOKMARKS)
				.then()
				.statusCode(Status.OK.getStatusCode())
				.body(Matchers.is("[]"));
	}
}
