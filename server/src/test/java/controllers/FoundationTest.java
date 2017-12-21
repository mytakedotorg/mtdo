/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import common.JoobyDevRule;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.jooby.Jooby;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.Test;

public class FoundationTest {
	static {
		Jooby jooby = new Jooby();
		jooby.use(new FoundationAssets());
		app = new JoobyDevRule(jooby);
	}

	@ClassRule
	public static JoobyDevRule app;

	@Test
	public void contentTypeJson() {
		RestAssured.get("/foundation-data/index.json").then()
				.statusCode(Status.OK.value())
				.contentType(ContentType.JSON);
	}
}
