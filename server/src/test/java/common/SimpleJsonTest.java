/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import org.junit.Assert;
import org.junit.Test;

public class SimpleJsonTest {
	@Test
	public void testUnescaped() {
		test("{}");
		test("{'key':'value'}", "key", "value");
		test("{'key':'value','a':'b'}", "key", "value", "a", "b");
	}

	private static void test(String expected, String... keyValue) {
		String actual = SimpleJson.unescapedStr(keyValue);
		Assert.assertEquals(expected.replace('\'', '"'), actual);
	}
}
