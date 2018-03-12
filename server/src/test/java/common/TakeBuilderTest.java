/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.StringPrinter;
import com.google.common.io.Resources;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;
import org.assertj.core.api.Assertions;
import org.junit.Assert;
import org.junit.Test;

public class TakeBuilderTest {
	@Test
	public void simple() {
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

	@Test
	public void dontWorryWellProtect() throws IOException {
		URL url = TakeBuilderTest.class.getResource("/initialdata/dont-worry-well-protect-the-constitution-for-you.json");
		String expected = Resources.toString(url, StandardCharsets.UTF_8);
		Assertions.assertThat(TakeBuilder.builder()
				.p("The system for appointing judges to the Supreme Court is quite complex. Only a lawyer with years of experience could understand it. But trust me \\u2013 this President has no right to make an appointment! We\\u2019ll let the people decide in the next election, as demanded by our Constitution!!")
				.document("c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=", 17730, 18357)
				.p("Don\\u2019t bother reading the Constitution, it\\u2019s only for smart people like me. Trust me \\u2013 the President is way out of line to think the Senate has any obligation to give his candidate a hearing!")
				.buildString()).isEqualTo(expected);

	}
}
