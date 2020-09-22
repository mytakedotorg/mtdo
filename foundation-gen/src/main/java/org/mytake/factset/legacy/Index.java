/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.legacy;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java2ts.FT.IndexPointer;
import java2ts.Routes;
import org.mytake.factset.Hashed;
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
