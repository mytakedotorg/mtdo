/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import java.util.Locale;

public class Word {
	final String lowercase;

	Word(String word) {
		this.lowercase = trimPunctuation(word).toLowerCase(Locale.ROOT);
	}

	private static boolean isNonPunctuation(char c) {
		return Character.isAlphabetic(c) || Character.isDigit(c) || c == '$' || c == '%';
	}

	public static String trimPunctuation(String input) {
		Preconditions.checkArgument(!input.isEmpty(), "Can't be empty!");
		char lastChar = input.charAt(input.length() - 1);
		char firstChar = input.charAt(0);
		Preconditions.checkArgument(!Character.isWhitespace(firstChar), "First char can't be whitespace!");
		Preconditions.checkArgument(!Character.isWhitespace(lastChar), "Last char can't be whitespace!");
		boolean trimFirst = !isNonPunctuation(firstChar);
		boolean trimLast = !isNonPunctuation(lastChar);
		if (trimFirst || trimLast) {
			if (trimLast && input.length() > 2) {
				char secondToLast = input.charAt(input.length() - 2); // e.g.: word."
				if (!isNonPunctuation(secondToLast)) {
					if (trimFirst) {
						return input.substring(1, input.length() - 2);
					} else {
						return input.substring(0, input.length() - 2);
					}
				}
			}
			if (trimFirst && trimLast && input.length() > 1) {
				return input.substring(1, input.length() - 1);
			} else if (trimFirst) {
				return input.substring(1);
			} else {
				return input.substring(0, input.length() - 1);
			}
		} else {
			return input;
		}
	}

	public String lowercase() {
		return lowercase;
	}

	@Override
	public String toString() {
		return lowercase;
	}

	public static class Vtt extends Word {
		final double time;

		public Vtt(String word, double time) {
			super(word.trim());
			this.time = time;
		}

		public double time() {
			return time;
		}
	}

	public static class Said extends Word {
		final int startIdx;

		public static Said dummy(String word) {
			return new Said(word, -1);
		}

		Said(String word, int startIdx) {
			super(word);
			this.startIdx = startIdx;
		}

		public int startIdx() {
			return startIdx;
		}

		public int endIdx() {
			return startIdx + lowercase.length();
		}
	}
}
