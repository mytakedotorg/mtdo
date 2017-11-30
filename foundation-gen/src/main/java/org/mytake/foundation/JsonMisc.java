/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.Config;
import java.io.OutputStream;

public class JsonMisc {
	private static final Config CONFIG = new Config.Builder()
			.escapeUnicode(false)
			.build();

	public static void toJson(Object object, OutputStream output) {
		JsonStream.serialize(CONFIG, object, output);
	}

	public static String toJson(Object object) {
		return JsonStream.serialize(CONFIG, object);
	}
}
