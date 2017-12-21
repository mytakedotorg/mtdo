/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import java.util.Base64;
import java.util.Random;

public class RandomString {
	public static final int FORTY_FOUR = 44;

	/** Returns a URL-safe random string of the given length.  Best if the length is divisible by 4. */
	public static String get(Random random, int length) {
		int numBytes = 3 * length / 4;
		byte[] bytes = new byte[numBytes];
		random.nextBytes(bytes);
		return Base64.getUrlEncoder().encodeToString(bytes);
	}
}
