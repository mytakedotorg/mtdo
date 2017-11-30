/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.diffplug.common.base.Errors;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java2ts.Foundation;
import java2ts.Foundation.Fact;
import java2ts.Foundation.FactLink;

public abstract class FactWriter<T extends Foundation.FactContent> {
	static {
		JsonMisc.init();
	}

	final List<FactLink> factLinks = new ArrayList<>();
	final Path dstDir;
	final Path srcDir;

	public FactWriter(Path srcDir, Path dstDir) {
		this.srcDir = srcDir;
		this.dstDir = dstDir;
		Errors.rethrow().run(() -> Files.createDirectories(dstDir));
	}

	public String read(String filename) {
		return Errors.rethrow().get(() -> {
			return new String(Files.readAllBytes(srcDir.resolve(filename)), StandardCharsets.UTF_8);
		});
	}

	protected static String slugify(String input) {
		return input.toLowerCase(Locale.ROOT)
				.replace(' ', '-') // replace spaces with hyphens
				.replaceAll("[-]+", "-") // replace multiple hypens with a single hyphen
				.replaceAll("[^\\w-]+", ""); // replace non-alphanumerics and non-hyphens
	}

	protected abstract T factToContent(Fact fact);

	protected void add(String title, String date, String dateKind, String kind) throws NoSuchAlgorithmException, IOException {
		Fact fact = new Fact();
		fact.title = title;
		fact.primaryDate = date;
		fact.primaryDateKind = dateKind;
		fact.kind = kind;

		T content = factToContent(fact);
		content.fact = fact;

		ByteArrayOutputStream output = new ByteArrayOutputStream();
		JsonMisc.toJson(content, output);
		byte[] contentBytes = output.toByteArray();
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(contentBytes);

		String hashStr = Base64.getUrlEncoder().encodeToString(hash);
		Files.write(dstDir.resolve(hashStr + ".json"), contentBytes);

		FactLink link = new FactLink();
		link.fact = fact;
		link.hash = hashStr;
		factLinks.add(link);
	}
}
