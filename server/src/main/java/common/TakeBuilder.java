/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.google.common.math.DoubleMath;
import com.jsoniter.any.Any;
import java.util.function.Consumer;

public class TakeBuilder {
	public static TakeBuilder builder() {
		return new TakeBuilder();
	}

	public static TakeBuilder builder(Consumer<TakeBuilder> builderConsumer) {
		TakeBuilder builder = new TakeBuilder();
		builderConsumer.accept(builder);
		return builder;
	}

	StringBuilder builder = new StringBuilder("[\n");

	public TakeBuilder p(String p) {
		builder.append("  {\n");
		builder.append("    \"kind\": \"paragraph\",\n");
		builder.append("    \"text\": \"");
		builder.append(p);
		builder.append("\"\n");
		builder.append("  },\n");
		return this;
	}

	public TakeBuilder video(String hash, double start, double end) {
		builder.append("  {\n");
		builder.append("    \"kind\": \"video\",\n");
		builder.append("    \"videoId\": \"" + hash + "\",\n");
		builder.append("    \"range\": [\n");
		builder.append("      " + jsonDouble(start) + ",\n");
		builder.append("      " + jsonDouble(end) + "\n");
		builder.append("    ]\n");
		builder.append("  },\n");
		return this;
	}

	private static String jsonDouble(double val) {
		if (DoubleMath.isMathematicalInteger(val)) {
			return Integer.toString((int) Math.round(val));
		} else {
			return Double.toString(val);
		}
	}

	public TakeBuilder document(String hash, int highlightStart, int highlightEnd) {
		return document(hash, highlightStart, highlightEnd, highlightStart, highlightEnd);
	}

	public TakeBuilder document(String hash, int highlightStart, int highlightEnd, int viewStart, int viewEnd) {
		builder.append("  {\n");
		builder.append("    \"kind\": \"document\",\n");
		builder.append("    \"excerptId\": \"" + hash + "\",\n");
		builder.append("    \"highlightedRange\": [\n");
		builder.append("      " + highlightStart + ",\n");
		builder.append("      " + highlightEnd + "\n");
		builder.append("    ],\n");
		builder.append("    \"viewRange\": [\n");
		builder.append("      " + viewStart + ",\n");
		builder.append("      " + viewEnd + "\n");
		builder.append("    ]\n");
		builder.append("  },\n");
		return this;
	}

	public Any buildAny() {
		return Any.wrap(buildString());
	}

	String result;

	public String buildString() {
		if (result == null) {
			result = buildStringInternal();
			builder = null;
		}
		return result;
	}

	private String buildStringInternal() {
		if (builder.length() == 2) {
			return "[]";
		} else {
			builder.setCharAt(builder.length() - 2, '\n');
			builder.setCharAt(builder.length() - 1, ']');
			return builder.toString();
		}
	}
}
