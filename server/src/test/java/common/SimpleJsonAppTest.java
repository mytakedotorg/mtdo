/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.assertj.core.api.Assertions;
import org.jooby.Jooby;
import org.jooby.Mutant;
import org.jooby.Status;
import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Test;

public class SimpleJsonAppTest {
	static class App extends Jooby {
		{
			get("/", req -> {
				Map<String, Mutant> map = req.params().toMap();
				String[] values = new String[2 * map.size()];
				AtomicInteger idx = new AtomicInteger();
				map.forEach((key, value) -> {
					values[idx.getAndIncrement()] = key;
					values[idx.getAndIncrement()] = value.value();
				});
				return SimpleJson.unescaped(values);
			});
		}
	}

	@ClassRule
	public static JoobyDevRule rule = new JoobyDevRule(new App());

	@Test
	public void testUnescaped() {
		Assertions.assertThat(
				RestAssured.given().get().then()
						.statusCode(Status.OK.value())
						.contentType(ContentType.JSON)
						.extract().body().asString())
				.isEqualTo("{}");
		test("{}");
		test("{'key':'value'}", "key", "value");
		test("{'a':'b','key':'value'}", "key", "value", "a", "b");
	}

	private static void test(String expected, String... keyValue) {
		RequestSpecification req = RestAssured.given();
		for (int i = 0; i < keyValue.length / 2; ++i) {
			String key = keyValue[2 * i];
			String value = keyValue[2 * i + 1];
			req = req.param(key, value);
		}
		Assert.assertEquals(expected.replace('\'', '"'), req.get().then()
				.statusCode(Status.OK.value())
				.contentType(ContentType.JSON)
				.extract().body().asString());
	}
}
