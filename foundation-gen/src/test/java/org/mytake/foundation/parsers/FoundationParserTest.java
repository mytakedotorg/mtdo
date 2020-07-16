/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2017 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation.parsers;

import org.junit.Assert;
import org.junit.Test;
import org.mytake.foundation.JsonMisc;

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
		Assert.assertEquals(expected, JsonMisc.toJson(FoundationParser.toComponents(input)));
	}

	@Test(expected = IllegalArgumentException.class)
	public void noNesting() {
		FoundationParser.toComponents("<p><strong>We the people</strong> of the United States</p>");
	}
}
