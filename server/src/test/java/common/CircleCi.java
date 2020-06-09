/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

public class CircleCi {
	public static boolean isCircle() {
		return System.getenv().containsKey("CIRCLECI");
	}
}
