/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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

import common.JoobyDevRule;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java2ts.Routes;
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
		RestAssured.get(Routes.FOUNDATION_INDEX_HASH).then()
				.statusCode(Status.OK.value())
				.contentType(ContentType.JSON);
	}
}
