/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import java.util.Locale;

public abstract class WordTime {
	final String lowercase;
	double time;

	private WordTime(String word, double time) {
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

	public static class Vtt extends WordTime {
		Vtt(String word, double time, int lineIdx, int tokenIdx) {
			super(word, time);
		}
	}

	public static class Speakers extends WordTime {
		Speakers(String word, int turnIdx, int startIdx) {
			super(word, Double.NaN);
		}
	}
}
