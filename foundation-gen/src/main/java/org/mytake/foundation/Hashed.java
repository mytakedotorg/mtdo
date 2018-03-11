/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import java.io.ByteArrayOutputStream;
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
		JsonMisc.toJson(content, output);
		byte[] contentBytes = output.toByteArray();
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(contentBytes);

		String hashStr = Base64.getUrlEncoder().encodeToString(hash);
		return new Hashed(contentBytes, hashStr);
	}
}
