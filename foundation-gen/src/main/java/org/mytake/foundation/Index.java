/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java2ts.Foundation.FactLink;
import java2ts.Foundation.IndexPointer;
import java2ts.Routes;

public class Index {
	public static void main(String[] args) throws IOException, NoSuchAlgorithmException {
		deleteDir(Folders.DST_FOUNDATION);

		List<FactLink> facts = new ArrayList<>();
		facts.addAll(Documents.national().factLinks);
		// TODO: put the videos back in
		//facts.addAll(Videos.national().factLinks);

		Hashed hashed = Hashed.asJson(facts);
		Files.write(Folders.DST_FOUNDATION.resolve(hashed.hash + ".json"), hashed.content);

		IndexPointer pointer = new IndexPointer();
		pointer.hash = hashed.hash;
		// substring(1) to remove '/'
		Files.write(Folders.DST_FOUNDATION.getParent().resolve(Routes.FOUNDATION_INDEX_HASH.substring(1)), Hashed.asJson(pointer).content);
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
