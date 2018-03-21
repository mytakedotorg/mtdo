/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import java.util.Locale;

public class WordTime {
	final String lowercase;
	double time;

	WordTime(String word, double time) {
		this.lowercase = trimPunctuation(word.trim()).toLowerCase(Locale.ROOT);
		this.time = time;
	}

	private static String trimPunctuation(String input) {
		char lastChar = input.charAt(input.length() - 1);
		if (!(Character.isAlphabetic(lastChar) || Character.isDigit(lastChar))) {
			return input.substring(0, input.length() - 1);
		} else {
			return input;
		}
	}

	public double time() {
		return time;
	}

	public boolean timeIsSet() {
		return !Double.isNaN(time);
	}

	public String lowercase() {
		return lowercase;
	}

	public static class Speakers extends WordTime {
		final int turnIdx;
		final int startIdx;

		Speakers(String word, int turnIdx, int startIdx) {
			super(word, Double.NaN);
			this.turnIdx = turnIdx;
			this.startIdx = startIdx;
		}

		public int turnIdx() {
			return turnIdx;
		}

		public int startIdx() {
			return startIdx;
		}
	}
}
