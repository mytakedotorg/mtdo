/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import db.tables.Account;
import java.util.Optional;
import org.jooby.Request;
import org.jooby.Response;

public class AuthUser {
	final long id;
	final String username;

	public AuthUser(long id, String username) {
		this.id = id;
		this.username = username;
	}

	public long id() {
		return id;
	}

	public String username() {
		return username;
	}

	public static Optional<AuthUser> authOpt(Request req) {
		throw new UnsupportedOperationException("TODO");
	}

	static final String LOGIN_COOKIE = "login";

	public static void login(Account into, Request req, Response rsp) {
		throw new UnsupportedOperationException("TODO");
	}
}
