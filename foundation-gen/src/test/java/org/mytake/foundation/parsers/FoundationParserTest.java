/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation.parsers;

import org.junit.Assert;
import org.junit.Test;

public class FoundationParserTest {
	@Test
	public void single() {
		testCase("<p>abc123</p>", "[{\"component\":\"p\",\"innerHTML\":\"abc123\",\"offset\":0}]");
	}

	@Test
	public void unicode() {
		testCase("<p>G°. Washington</p>", "[{\"component\":\"p\",\"innerHTML\":\"G°. Washington\",\"offset\":0}]");
	}

	@Test
	public void multiple() {
		testCase("<p>G°. Washington</p>\n" +
				"	<h2>Article. I.</h2>\n" +
				"	<h3>Section. 1.</h3>",
				"[{\"component\":\"p\",\"innerHTML\":\"G°. Washington\",\"offset\":0},{\"component\":\"h2\",\"innerHTML\":\"Article. I.\",\"offset\":14},{\"component\":\"h3\",\"innerHTML\":\"Section. 1.\",\"offset\":25}]");
	}

	private void testCase(String input, String expected) {
		Assert.assertEquals(expected, FoundationParser.toJson(input));
	}

	@Test(expected = IllegalArgumentException.class)
	public void noNesting() {
		FoundationParser.toJson("<p><strong>We the people</strong> of the United States</p>");
	}
}
