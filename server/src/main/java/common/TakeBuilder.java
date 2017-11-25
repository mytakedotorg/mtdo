/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

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

	public Any buildAny() {
		return Any.wrap(buildString());
	}

	public String buildString() {
		if (builder.length() == 2) {
			builder = null;
			return "[]";
		} else {
			builder.setCharAt(builder.length() - 2, '\n');
			builder.setCharAt(builder.length() - 1, ']');
			String str = builder.toString();
			builder = null;
			return str;
		}
	}
}
