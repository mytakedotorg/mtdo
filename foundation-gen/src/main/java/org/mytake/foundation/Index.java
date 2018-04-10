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
import java2ts.Foundation.IndexPointer;
import java2ts.Routes;
import org.mytake.lucene.Lucene;

public class Index {
	public static void main(String[] args) throws Throwable {
		deleteDir(Folders.DST_FOUNDATION);
		deleteDir(Folders.DST_LUCENE_INDEX);

		FactWriter factWriter = new FactWriter(Folders.DST_FOUNDATION);
		Documents.national(factWriter);
		try (Lucene.Writer writer = new Lucene.Writer(Folders.DST_LUCENE_INDEX)) {
			Videos.presidentialDebates(factContentJava -> {
				String hash = factWriter.writeAndReturnHash(factContentJava.toEncoded());
				writer.writeVideo(hash, factContentJava);
			});
		}

		Hashed hashed = factWriter.hashedFactLinks();
		Files.write(Folders.DST_FOUNDATION.resolve(hashed.hash + ".json"), hashed.content);

		IndexPointer pointer = new IndexPointer();
		pointer.hash = hashed.hash;
		// substring(1) to remove '/'
		Files.write(Folders.DST_FOUNDATION.getParent().resolve(Routes.FOUNDATION_INDEX_HASH.substring(1)), Hashed.asJson(pointer).content);
	}

	private static void deleteDir(Path folder) throws IOException {
		if (Files.exists(folder)) {
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
		Files.createDirectories(folder);
	}
}
