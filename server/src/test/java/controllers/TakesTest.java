/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import static io.restassured.RestAssured.get;

import common.JoobyDevRule;
import common.Snapshot;
import org.junit.ClassRule;
import org.junit.Test;

public class TakesTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void viewArticle() {
		Snapshot.match("viewArticle", get("/samples/why-its-so-hard-to-have-peace"));
	}

	@Test
	public void viewUser() {
		Snapshot.match("viewUser", get("/samples"));
		Snapshot.match("viewUserOther", get("/other"));
	}
}
