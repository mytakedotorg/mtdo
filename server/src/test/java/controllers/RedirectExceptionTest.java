/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static io.restassured.RestAssured.given;

import common.JoobyDevRule;
import common.RedirectException;
import org.jooby.Jooby;
import org.junit.ClassRule;
import org.junit.Test;

public class RedirectExceptionTest {
	static class App extends Jooby {
		{
			use(new RedirectException.Module());
			get("/redirectToGo", req -> {
				throw RedirectException.notFoundUrl("/go");
			});
			get("/urlWasInvalid", req -> {
				throw RedirectException.invalidUrlError("URL was invalid!");
			});
			get("/resourceNotFound", req -> {
				throw RedirectException.notFoundError("Resource not found!");
			});
		}
	}

	@ClassRule
	public static JoobyDevRule dev = new JoobyDevRule(new App());

	@Test
	public void redirectToGo() {
		given().redirects().follow(false).get("/redirectToGo")
				.then().header("Location", "/go");
	}

	@Test
	public void urlWasInvalid() {
		given().redirects().follow(false).get("/urlWasInvalid")
				.then().header("Location", "/error?msg=URL+was+invalid%21");
	}

	@Test
	public void resourceNotFound() {
		given().redirects().follow(false).get("/resourceNotFound")
				.then().header("Location", "/notFound?msg=Resource+not+found%21");
	}
}
