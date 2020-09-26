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
package controllers;

import io.restassured.RestAssured;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.jooby.Jooby;
import org.junit.Assert;
import org.junit.Test;

public class FactApiTest {
	@Test
	public void prod() throws Exception {
		testFactModule(new FactApi());
	}

	private void testFactModule(Jooby.Module factApiModule) throws Exception {
		try (AutoCloseable server = startServer(factApiModule)) {
			byte[] actualBytes = RestAssured.given().get("/api/fact/1/c2a9d475e448866c48a1f7c0d5f98c6fc2bfe6a3").then()
					.contentType("application/json")
					.extract().body().asByteArray();
			String actual = new String(actualBytes, StandardCharsets.UTF_8);
			byte[] expectedBytes = Files.readAllBytes(Paths.get("../factset-tooling/src/test/resources/org/mytake/factset/gradle/kennedy-nixon-1-of-4.json"));
			String expected = new String(expectedBytes, StandardCharsets.UTF_8);
			Assert.assertEquals(FactApi.recondense(expected), actual);
		}
	}

	private AutoCloseable startServer(Jooby.Module factApiModule) {
		Jooby jooby = new Jooby();
		jooby.use(factApiModule);
		jooby.start("server.join=false");
		return () -> {
			jooby.stop();
		};
	}
}
