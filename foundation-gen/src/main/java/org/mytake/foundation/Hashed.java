/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018 MyTake.org, Inc.
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
