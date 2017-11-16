/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class TakeBuilder {
	public static TakeBuilder builder() {
		return new TakeBuilder();
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

	String build() {
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

	public JsonElement buildJson() {
		return new JsonParser().parse(build());
	}
}
