/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import com.jsoniter.JsonIterator;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.Config;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.JsoniterSpi;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;

public class JsonMisc {
	static {
		JsoniterSpi.registerTypeDecoder(Number.class, iter -> iter.readInt());
		CONFIG = new Config.Builder()
				.escapeUnicode(false)
				.decodingMode(DecodingMode.REFLECTION_MODE)
				.encodingMode(EncodingMode.REFLECTION_MODE)
				.build();
	}

	private static final Config CONFIG;

	public static void toJson(Object object, OutputStream output) {
		JsonStream.serialize(CONFIG, object, output);
	}

	public static String toJson(Object object) {
		return JsonStream.serialize(CONFIG, object);
	}

	public static <T> T fromJson(File file, Class<T> clazz) throws IOException {
		return JsonIterator.deserialize(CONFIG, Files.readAllBytes(file.toPath()), clazz);
	}
}
