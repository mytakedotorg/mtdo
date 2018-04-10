/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java2ts.Foundation.IndexPointer;
import java2ts.Routes;
import org.mytake.lucene.Lucene;
import org.mytake.lucene.ZipMisc;

public class Index {
	public static void main(String[] args) throws Throwable {
		cleanDir(Folders.DST_FOUNDATION_DATA);
		Path luceneTemp = Files.createTempDirectory("mytake-lucene");

		FactWriter factWriter = new FactWriter(Folders.DST_FOUNDATION_DATA);
		Documents.national(factWriter);
		try (Lucene.Writer writer = new Lucene.Writer(luceneTemp)) {
			Videos.presidentialDebates(factContentJava -> {
				String hash = factWriter.writeAndReturnHash(factContentJava.toEncoded());
				writer.writeVideo(hash, factContentJava);
			});
		}

		// zip the index into a file, and delete the spread-out index
		ZipMisc.zip(luceneTemp, Folders.DST_FOUNDATION_RESOURCES.resolve(Lucene.INDEX_ARCHIVE));
		ZipMisc.deleteDir(luceneTemp);

		// write out the index
		Hashed hashed = factWriter.hashedFactLinks();
		Files.write(Folders.DST_FOUNDATION_DATA.resolve(hashed.hash + ".json"), hashed.content);

		// and the index-pointer
		IndexPointer pointer = new IndexPointer();
		pointer.hash = hashed.hash;
		// substring(1) to remove '/'
		Files.write(Folders.DST_FOUNDATION_DATA.getParent().resolve(Routes.FOUNDATION_INDEX_HASH.substring(1)), Hashed.asJson(pointer).content);
	}

	private static void cleanDir(Path folder) throws IOException {
		ZipMisc.deleteDir(folder);
		Files.createDirectories(folder);
	}
}
