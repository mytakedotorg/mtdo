/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.foundation;

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
