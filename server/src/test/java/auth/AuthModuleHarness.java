/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package auth;

import static db.Tables.ACCOUNT;
import static io.restassured.RestAssured.given;

import common.JoobyDevRule;
import db.tables.pojos.Account;
import io.restassured.specification.RequestSpecification;
import org.jooby.Jooby;

public class AuthModuleHarness {
	public static RequestSpecification givenUser(Jooby app, Account account) {
		return given().cookie(AuthUser.LOGIN_COOKIE, AuthUser.jwtToken(app, account));
	}

	public static String authTokenValue(JoobyDevRule dev, String username) {
		Account account = dev.fetchRecord(ACCOUNT, ACCOUNT.USERNAME, username).into(Account.class);
		return AuthUser.jwtToken(dev.app(), account);
	}
}
