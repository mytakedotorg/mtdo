/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
		return fromJson(Files.readAllBytes(file.toPath()), clazz);
	}

	public static <T> T fromJson(byte[] content, Class<T> clazz) throws IOException {
		return JsonIterator.deserialize(CONFIG, content, clazz);
	}
}
