/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.document;


import org.junit.Assert;
import org.junit.Test;
import org.mytake.factset.GitJson;

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
		Assert.assertEquals(expected, GitJson.write(FoundationParser.toComponents(input)).toRecondensedForDebugging());
	}

	@Test(expected = IllegalArgumentException.class)
	public void noNesting() {
		FoundationParser.toComponents("<p><strong>We the people</strong> of the United States</p>");
	}
}
