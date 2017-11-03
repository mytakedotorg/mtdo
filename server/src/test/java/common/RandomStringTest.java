/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Random;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class RandomStringTest {
	@Test
	public void testSafe() throws UnsupportedEncodingException {
		Random randomGen = new Random(0);
		for (int i = 4; i < 100; i += 4) {
			String random = RandomString.get(randomGen, i);
			Assertions.assertThat(random).hasSize(i);
			Assertions.assertThat(random).isEqualTo(URLEncoder.encode(random, "UTF-8"));
		}
	}
}
