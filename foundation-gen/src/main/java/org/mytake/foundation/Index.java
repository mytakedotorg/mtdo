/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.jsoniter.output.JsonStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java2ts.Foundation.FactLink;

public class Index {
	public static void main(String[] args) throws IOException, NoSuchAlgorithmException {
		deleteDir(Folders.DST_FOUNDATION);

		List<FactLink> facts = new ArrayList<>();
		facts.addAll(Documents.national().factLinks);
		facts.addAll(Videos.national().factLinks);

		try (OutputStream output = new BufferedOutputStream(
				Files.newOutputStream(Folders.DST_FOUNDATION.resolve("index.json")))) {
			JsonStream.serialize(facts, output);
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
