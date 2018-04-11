/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.lucene;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.ByteStreams;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class ZipMisc {
	public static void unzip(InputStream bufferedInput, Path destinationDir) throws IOException {
		try (ZipInputStream zipInput = new ZipInputStream(bufferedInput)) {
			ZipEntry entry;
			while ((entry = zipInput.getNextEntry()) != null) {
				Path dest = destinationDir.resolve(entry.getName());
				if (entry.isDirectory()) {
					Files.createDirectories(dest);
				} else {
					Files.createDirectories(dest.getParent());
					Files.write(dest, ByteStreams.toByteArray(zipInput));
				}
			}
		}
	}

	public static void zip(Path inputFolder, Path outputFile) throws IOException {
		try (ZipOutputStream zs = new ZipOutputStream(Files.newOutputStream(outputFile))) {
			Files.walk(inputFolder)
					.filter(path -> !Files.isDirectory(path))
					.forEach(Errors.rethrow().wrap(path -> {
						ZipEntry zipEntry = new ZipEntry(inputFolder.relativize(path).toString());
						zs.putNextEntry(zipEntry);
						Files.copy(path, zs);
						zs.closeEntry();
					}));
		}
	}

	public static void deleteDir(Path folder) throws IOException {
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
	}
}
