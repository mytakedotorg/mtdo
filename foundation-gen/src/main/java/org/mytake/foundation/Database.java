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
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java2ts.Foundation;
import java2ts.Foundation.Fact;
import java2ts.Foundation.FactLink;

public abstract class Database {
	final List<FactLink> factLinks = new ArrayList<>();
	final Path dstDir;
	final Path srcDir;

	public Database(Path srcDir, Path dstDir) {
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

	protected abstract String factToContent(Fact fact);

	protected void add(String title, String date, String dateKind, String kind) throws NoSuchAlgorithmException, IOException {
		Fact fact = new Fact();
		fact.title = title;
		fact.primaryDate = date;
		fact.primaryDateKind = dateKind;
		fact.kind = kind;

		byte[] content = factToContent(fact).getBytes(StandardCharsets.UTF_8);
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		byte[] hash = digest.digest(content);

		String hashStr = Base64.getUrlEncoder().encodeToString(hash);
		Files.write(dstDir.resolve(hashStr + ".json"), content);

		FactLink link = new FactLink();
		link.fact = fact;
		link.hash = hashStr;
		factLinks.add(link);
	}

	public static void main(String[] args) throws IOException, NoSuchAlgorithmException {
		deleteDir(Folders.DST_FOUNDATION);
		List<Foundation.FactLink> documents = Documents.national().factLinks;
		try (OutputStream output = new BufferedOutputStream(
				Files.newOutputStream(Folders.DST_FOUNDATION.resolve("index.json")))) {
			JsonStream.serialize(documents, output);
		}
	}

	private static void deleteDir(Path folder) throws IOException {
		if (!Files.exists(folder)) {
			return;
		}
		Files.walkFileTree(folder, new SimpleFileVisitor<Path>() {
			@Override
			public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
				Files.delete(file);
				return FileVisitResult.CONTINUE;
			}

			@Override
			public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
				if (exc == null) {
					Files.delete(dir);
					return FileVisitResult.CONTINUE;
				} else {
					throw exc;
				}
			}
		});
	}
}
