/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.Unhandled;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.function.Function;

/**
 * In a VTT file, such as this:
 * 
 * ```
 * 00:00:00.030 --> 00:00:03.929 align:start position:19%
 * we<00:00:00.780><c> will</c><00:00:00.930><c> now</c><c.colorE5E5E5>....
 * ```
 * 
 * The VttTokens are these:
 * 
 * `we`, `<00:00:00.780>`, `<c> will</c>`, `<00:00:00.930>`, `<c> now</c>`, `<c.colorE5E5E5>`, 
 */
public abstract class VttToken {
	boolean isWord() {
		return this instanceof VttToken.Word;
	}

	boolean isTime() {
		return this instanceof VttToken.Time;
	}

	public VttToken.Word assertWord() {
		return (VttToken.Word) this;
	}

	public VttToken.Time assertTime() {
		return (VttToken.Time) this;
	}

	public abstract String asString();

	@Override
	public String toString() {
		return asString();
	}

	@Override
	public final boolean equals(Object other) {
		if (other instanceof VttToken) {
			VttToken o = (VttToken) other;
			return o.asString().equals(asString());
		} else {
			return false;
		}
	}

	@Override
	public final int hashCode() {
		return asString().hashCode();
	}

	///////////////////////
	// Kinds of VttToken //
	///////////////////////
	public static class Word extends VttToken {
		final String word;

		public Word(String word) {
			this.word = word;
		}

		@Override
		public String asString() {
			return "<c>" + word + "</c>";
		}
	}

	public static class Mod extends VttToken {
		final String modifier;

		Mod(String modifier) {
			this.modifier = modifier;
		}

		@Override
		public String asString() {
			return "<c." + modifier + ">";
		}
	}

	public static class Time extends VttToken {
		final double timestamp;

		public Time(double timestamp) {
			this.timestamp = timestamp;
		}

		public Time(String timestamp) {
			this(VttTranscript.str2ts(timestamp));
		}

		@Override
		public String asString() {
			return "<" + VttTranscript.ts2str(timestamp) + ">";
		}
	}

	/////////////
	// Parsing //
	/////////////
	public static List<VttToken> parseLine(String line) {
		Iterator<VttToken> iter = new TokenStream(line);
		List<VttToken> tokens = new ArrayList<>();
		while (iter.hasNext()) {
			tokens.add(iter.next());
		}
		return tokens;
	}

	public static String lineAsString(List<VttToken> tokens) {
		if (tokens.isEmpty()) {
			return "";
		}
		StringBuilder builder = new StringBuilder();
		VttToken firstToken = tokens.get(0);
		if (firstToken.isWord()) {
			builder.append(firstToken.assertWord().word);
		}
		for (int i = 1; i < tokens.size(); ++i) {
			builder.append(tokens.get(i).asString());
		}
		builder.append("</c>");
		return builder.toString();
	}

	private static class TokenStream implements Iterator<VttToken> {
		final String line;

		Type type;
		int tokenEnd;
		int contentStart, contentEnd;

		TokenStream(String line) {
			this.line = line;
			if (line.isEmpty()) {
				type = null;
			} else if (line.charAt(0) == '<') {
				initMod(0);
			} else {
				// special handling for the first word
				type = Type.WORD;
				contentStart = 0;
				tokenEnd = contentEnd = line.indexOf('<');
			}
		}

		private void initMod(int tokenStart) {
			this.type = Type.MOD;
			this.contentStart = tokenStart + 3;
			this.contentEnd = line.indexOf('>', contentStart + 1);
			this.tokenEnd = contentEnd + 1;
			Preconditions.checkState(line.subSequence(tokenStart, contentStart).equals("<c."));
		}

		private void initWord(int tokenStart) {
			this.type = Type.WORD;
			this.contentStart = tokenStart + 3;
			this.contentEnd = line.indexOf("</c>", contentStart);
			this.tokenEnd = contentEnd + 4;
		}

		private void initTime(int tokenStart) {
			this.type = Type.TIME;
			this.contentStart = tokenStart + 1;
			this.contentEnd = line.indexOf('>', contentStart + 1);
			this.tokenEnd = contentEnd + 1;
		}

		private String content() {
			return line.substring(contentStart, contentEnd);
		}

		public boolean hasNext() {
			return type != null;
		}

		// @formatter:off
		@Override
		public VttToken next() {
			// create this token
			Function<String, VttToken> constructor = type.wordTimeMod(VttToken.Word::new, VttToken.Time::new, VttToken.Mod::new);
			VttToken token = constructor.apply(content());
			// find the next one
			int tokenStart = tokenEnd;
			String remainder = line.substring(tokenStart);
			if (remainder.equals("</c>")) {
				// every line ends with </c> for some reason
				type = null;
			} else if (remainder.startsWith("<c>")) {
				initWord(tokenStart);
			} else if (remainder.startsWith("<c.")) {
				initMod(tokenStart);
			} else {
				initTime(tokenStart);
			}
			return token;
		}

		private enum Type {
			WORD, TIME, MOD;

			public <T> T wordTimeMod(T word, T time, T mod) {
				switch (this) {
				case WORD: return word;
				case TIME: return time;
				case MOD: return mod;
				default: throw Unhandled.enumException(this);
				}
			}
		}
		// @formatter:on
	}
}
