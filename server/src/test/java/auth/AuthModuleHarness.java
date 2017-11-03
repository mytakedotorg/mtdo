/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static io.restassured.RestAssured.given;

import db.tables.pojos.Account;
import io.restassured.specification.RequestSpecification;
import org.jooby.Jooby;

public class AuthModuleHarness {
	public static RequestSpecification givenUser(Jooby app, Account account) {
		return given().cookie(AuthUser.LOGIN_COOKIE, AuthUser.jwtToken(app, account));
	}
}
