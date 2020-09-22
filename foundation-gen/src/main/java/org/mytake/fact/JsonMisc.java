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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.fact;


import com.jsoniter.JsonIterator;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.Config;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.JsoniterSpi;
import com.jsoniter.spi.TypeLiteral;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
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

	public static void toJson(Object object, File output) throws IOException {
		Files.write(output.toPath(), toJson(object).getBytes(StandardCharsets.UTF_8));
	}

	public static void toJson(Object object, OutputStream output) {
		JsonStream.serialize(CONFIG, object, output);
	}

	public static String toJson(Object object) {
		return JsonStream.serialize(CONFIG, object);
	}

	public static <T> T fromJson(File file, TypeLiteral<T> type) throws IOException {
		return JsonIterator.deserialize(CONFIG, Files.readAllBytes(file.toPath()), type);
	}

	public static <T> T fromJson(File file, Class<T> clazz) throws IOException {
		return fromJson(Files.readAllBytes(file.toPath()), clazz);
	}

	public static <T> T fromJson(String content, TypeLiteral<T> type) throws IOException {
		return JsonIterator.deserialize(CONFIG, content.getBytes(StandardCharsets.UTF_8), type);
	}

	public static <T> T fromJson(String content, Class<T> clazz) throws IOException {
		return fromJson(content.getBytes(StandardCharsets.UTF_8), clazz);
	}

	public static <T> T fromJson(byte[] content, Class<T> clazz) throws IOException {
		return JsonIterator.deserialize(CONFIG, content, clazz);
	}
}
