/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
		Snapshot.match("viewUserEmpty", get("/empty"));
	}
}
