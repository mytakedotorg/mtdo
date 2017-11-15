/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static io.restassured.RestAssured.given;

import common.CustomAssets;
import common.Dev;
import common.JoobyDevRule;
import common.RedirectException;
import common.Snapshot;
import org.jooby.Jooby;
import org.jooby.Status;
import org.jooby.rocker.Rockerby;
import org.junit.ClassRule;
import org.junit.Test;

public class RedirectExceptionTest {
	static class App extends Jooby {
		{
			use(new Rockerby());
			use(new CustomAssets());
			Dev.rockerDevInit();
			use(new RedirectException.Module());
			get("/urlWasInvalid", req -> {
				throw RedirectException.badRequestError("URL was invalid!");
			});
			get("/resourceNotFound", req -> {
				throw RedirectException.notFoundError("Resource not found!");
			});
		}
	}

	@ClassRule
	public static JoobyDevRule dev = new JoobyDevRule(new App());

	@Test
	public void urlWasInvalid() {
		given().redirects().follow(false).get("/urlWasInvalid")
				.then()
				.statusCode(Status.BAD_REQUEST.value())
				.header("Location", "/badRequest?msg=URL+was+invalid%21");
		Snapshot.match("urlWasInvalid", given().urlEncodingEnabled(false)
				.get("/badRequest?msg=URL+was+invalid%21")
				.body().asString());
	}

	@Test
	public void resourceNotFound() {
		given().redirects().follow(false).get("/resourceNotFound")
				.then()
				.statusCode(Status.NOT_FOUND.value())
				.header("Location", "/notFound?msg=Resource+not+found%21");
		Snapshot.match("resourceNotFound", given().urlEncodingEnabled(false)
				.get("/notFound?msg=Resource+not+found%21")
				.body().asString());
	}
}
