/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import org.assertj.core.api.Assertions;
import org.junit.Test;

public class TextTest {
	@Test
	public void slugify() {
		slugifyCase("", "");
		slugifyCase(" ", "-");
		slugifyCase("  ", "-");
		slugifyCase("a", "a");
		slugifyCase("A", "a");
		slugifyCase("?", "");
		slugifyCase("What - how can you say that?", "what-how-can-you-say-that");
	}

	private void slugifyCase(String raw, String expected) {
		Assertions.assertThat(Text.slugify(raw)).isEqualTo(expected);
	}
}
