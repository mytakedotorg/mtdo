/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.factset.video;


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
