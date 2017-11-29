/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.diffplug.common.base.Errors;
import com.jsoniter.output.JsonStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java2ts.Foundation;
import java2ts.Foundation.Fact;

public abstract class Database {
	final List<Fact> facts = new ArrayList<>();
	final File dstDir;
	final File srcDir;

	public Database(File srcDir, File dstDir) {
		this.srcDir = srcDir;
		this.dstDir = dstDir;
	}

	public String read(String filename) {
		Path path = new File(srcDir, filename).toPath();
		return Errors.rethrow().get(() -> {
			return new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
		});
	}

	protected static String slugify(String input) {
		return input.toLowerCase(Locale.ROOT)
				.replace(' ', '-') // replace spaces with hyphens
				.replaceAll("[-]+", "-") // replace multiple hypens with a single hyphen
				.replaceAll("[^\\w-]+", ""); // replace non-alphanumerics and non-hyphens
	}

	protected abstract String titleToContent(String title);

	protected void add(String title, String date, String dateKind, String kind) throws NoSuchAlgorithmException, IOException {
		Fact fact = new Fact();
		fact.title = title;
		fact.primaryDate = date;
		fact.primaryDateKind = dateKind;
		fact.kind = kind;
		byte[] content = titleToContent(title).getBytes(StandardCharsets.UTF_8);

		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(content);
		String url = Base64.getUrlEncoder().encodeToString(hash);
		fact.url = url;
		Files.write(dstDir.toPath().resolve(url), content);
		facts.add(fact);
	}

	public static void main(String[] args) throws IOException, NoSuchAlgorithmException {
		List<Foundation.Fact> documents = Documents.national().facts;

		Path foundation = Paths.get("../foundation/src/main/resources/foundation");
		try (OutputStream output = new BufferedOutputStream(
				Files.newOutputStream(foundation.resolve("index.js")))) {
			JsonStream.serialize(documents, output);
		}

		Path speakermapSrc = Paths.get("src/main/resources/video/speakermap");
		Path speakermapDst = Paths.get("../foundation/src/main/resources/foundation/video/speakermap");
		Files.createDirectories(speakermapDst);
		for (File file : speakermapSrc.toFile().listFiles()) {
			Files.copy(file.toPath(), speakermapDst.resolve(file.getName()), StandardCopyOption.REPLACE_EXISTING);
		}
	}
}
