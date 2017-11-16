/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.common.base.Preconditions;
import org.jooby.Result;
import org.jooby.Results;

public class SimpleJson {
	public static Result unescaped(String... keyValue) {
		return Results.json(unescapedStr(keyValue));
	}

	static String unescapedStr(String... keyValue) {
		if (keyValue.length == 0) {
			return "{}";
		}
		Preconditions.checkArgument(keyValue.length % 2 == 0, "Must be an even number of args");
		//         {}  " ":" ",
		int size = 2 + 3 * keyValue.length;
		for (String v : keyValue) {
			size += v.length();
		}
		StringBuilder builder = new StringBuilder(size);
		builder.append('{');
		for (int i = 0; i < keyValue.length / 2; ++i) {
			String key = keyValue[2 * i];
			String value = keyValue[2 * i + 1];
			builder.append('"');
			builder.append(key);
			builder.append('"');
			builder.append(':');
			builder.append('"');
			builder.append(value);
			builder.append('"');
			builder.append(',');
		}
		builder.setCharAt(builder.length() - 1, '}');
		return builder.toString();
	}
}
