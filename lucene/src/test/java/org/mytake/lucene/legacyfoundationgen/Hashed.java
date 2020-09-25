/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.lucene.legacyfoundationgen;

import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.Config;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.JsoniterSpi;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class Hashed {
	public final byte[] content;
	public final String hash;

	private Hashed(byte[] content, String hash) {
		this.content = content;
		this.hash = hash;
	}

	public static Hashed asJson(Object content) throws NoSuchAlgorithmException {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		toJson(content, output);
		byte[] contentBytes = output.toByteArray();
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(contentBytes);

		String hashStr = Base64.getUrlEncoder().encodeToString(hash);
		return new Hashed(contentBytes, hashStr);
	}

	static {
		JsoniterSpi.registerTypeDecoder(Number.class, iter -> iter.readInt());
		CONFIG = new Config.Builder()
				.escapeUnicode(false)
				.decodingMode(DecodingMode.REFLECTION_MODE)
				.encodingMode(EncodingMode.REFLECTION_MODE)
				.build();
	}

	private static final Config CONFIG;

	private static void toJson(Object object, OutputStream output) {
		JsonStream.serialize(CONFIG, object, output);
	}
}
