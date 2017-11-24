/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.StringPrinter;
import java.util.function.Consumer;
import org.junit.Assert;
import org.junit.Test;

public class TakeBuilderTest {
	@Test
	public void build() {
		testCase(b -> {}, "[]");
		testCase(b -> b.p("a"),
				"[",
				"  {",
				"    \"kind\": \"paragraph\",",
				"    \"text\": \"a\"",
				"  }",
				"]");
		testCase(b -> b.p("a").p("b"),
				"[",
				"  {",
				"    \"kind\": \"paragraph\",",
				"    \"text\": \"a\"",
				"  },",
				"  {",
				"    \"kind\": \"paragraph\",",
				"    \"text\": \"b\"",
				"  }",
				"]");
	}

	private void testCase(Consumer<TakeBuilder> b, String... lines) {
		String expected = StringPrinter.buildStringFromLines(lines);
		Assert.assertEquals(expected.substring(0, expected.length() - 1),
				TakeBuilder.builder(b).buildString());
	}
}
