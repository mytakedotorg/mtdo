/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
