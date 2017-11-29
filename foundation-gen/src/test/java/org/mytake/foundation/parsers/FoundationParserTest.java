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
		testCase("<p>abc123</p>", "[{\"component\":\"p\",\"innerHTML\":\"abc123\"}]");
	}

	@Test
	public void unicode() {
		testCase("<p>G°. Washington</p>", "[{\"component\":\"p\",\"innerHTML\":\"G°. Washington\"}]");
	}

	@Test
	public void multiple() {
		testCase("<p>We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.</p>\n" +
				"	<h2>Article. I.</h2>\n" +
				"	<h3>Section. 1.</h3>\n" +
				"	<p>All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.</p>", "[{\"component\":\"p\",\"innerHTML\":\"We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.\"},{\"component\":\"h2\",\"innerHTML\":\"Article. I.\"},{\"component\":\"h3\",\"innerHTML\":\"Section. 1.\"},{\"component\":\"p\",\"innerHTML\":\"All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.\"}]");
	}

	private void testCase(String input, String expected) {
		Assert.assertEquals(expected, FoundationParser.toJson(input));
	}

	@Test(expected = IllegalArgumentException.class)
	public void noNesting() {
		FoundationParser.toJson("<p><strong>We the people</strong> of the United States</p>");
	}
}
