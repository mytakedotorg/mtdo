/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.fact;


import com.diffplug.common.base.Preconditions;

public class GitJson {
	public static final char COMMENT_OPEN = '⌊';
	public static final char COMMENT_CLOSE = '⌋';

	/**
	 * Minified json is guaranteed to have no newlines, just a long single-line string.
	 * This makes it terrible to git diff with a standard line-based differ.
	 * To improve that behavior:
	 * - add newlines anywhere, they will be removed
	 * - add ⌊⌋ pairs (mathematic floor) anywhere, they are treated as a comment and removed
	 */
	public static String recondense(String in, StringBuilder buffer) {
		Preconditions.checkArgument(!in.isEmpty());
		Preconditions.checkArgument(in.charAt(0) != '\n');
		Preconditions.checkArgument(in.charAt(0) != COMMENT_OPEN);
		buffer.setLength(0);
		int start = 0;
		int next;
		while ((next = nextParsePaint(in, start)) != 0) {
			if (next > 0) {
				// was '\n'
				buffer.append(in, start, next);
				start = next + 1; // skip the \n
			} else {
				// was ⌊, ignore everything up to the next ⌋
				buffer.append(in, start, -next);
				int close = in.indexOf(COMMENT_CLOSE, -next + 1);
				if (close == -1) {
					return buffer.toString();
				} else {
					start = close + 1;
				}
			}
		}
		if (start < in.length()) {
			buffer.append(in, start, in.length());
		}
		return buffer.toString();
	}

	private static int nextParsePaint(String in, int startFrom) {
		for (int i = startFrom; i < in.length(); ++i) {
			char c = in.charAt(i);
			if (c == '\n') {
				return i;
			} else if (c == COMMENT_OPEN) {
				return -i;
			}
		}
		return 0; // signifies end of string
	}

	public static String recondense(String in) {
		return recondense(in, new StringBuilder(in.length()));
	}
}
