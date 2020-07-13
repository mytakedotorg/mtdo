/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
 * You can contact us at team@mytake.org
 */
package common;

import com.google.common.math.DoubleMath;
import com.jsoniter.any.Any;
import java.util.function.Consumer;
import org.jooq.JSONB;

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

	JSONB result;

	public JSONB buildJson() {
		if (result == null) {
			result = JSONB.valueOf(buildStringInternal());
			builder = null;
		}
		return result;
	}

	public String buildString() {
		return buildJson().data();
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
