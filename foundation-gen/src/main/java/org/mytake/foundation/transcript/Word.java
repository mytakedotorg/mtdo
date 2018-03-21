/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import java.util.Locale;

public class Word {
	final String lowercase;

	Word(String word) {
		this.lowercase = trimPunctuation(word).toLowerCase(Locale.ROOT);
	}

	private static String trimPunctuation(String input) {
		char lastChar = input.charAt(input.length() - 1);
		Preconditions.checkArgument(!Character.isWhitespace(input.charAt(0)), "First char can't be whitespace!");
		Preconditions.checkArgument(!Character.isWhitespace(lastChar), "Last char can't be whitespace!");
		if (!(Character.isAlphabetic(lastChar) || Character.isDigit(lastChar))) {
			// strip punctuation
			return input.substring(0, input.length() - 1);
		} else {
			return input;
		}
	}

	public String lowercase() {
		return lowercase;
	}

	public static class Vtt extends Word {
		final double time;

		Vtt(String word, double time) {
			super(word);
			this.time = time;
		}

		public double time() {
			return time;
		}
	}

	public static class Said extends Word {
		final int turnIdx;
		final int startIdx;

		Said(String word, int turnIdx, int startIdx) {
			super(word);
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
