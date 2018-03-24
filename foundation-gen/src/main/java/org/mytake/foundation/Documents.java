/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import java.io.IOException;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java2ts.Foundation;
import java2ts.Foundation.DocumentFactContent;
import java2ts.Foundation.Fact;
import org.mytake.foundation.parsers.FoundationParser;

public class Documents extends FactWriter<DocumentFactContent> {
	public static Documents national() throws NoSuchAlgorithmException, IOException {
		Documents documents = new Documents(Folders.SRC_DOCUMENT, Folders.DST_FOUNDATION);
		documents.add("United States Constitution", "1788-06-21");
		documents.add("Bill of Rights", "1791-12-15");
		documents.add("Amendment 11", "1795-02-07");
		documents.add("Amendment 12", "1804-06-15");
		documents.add("Amendment 13", "1865-12-06");
		documents.add("Amendment 14", "1868-07-09");
		documents.add("Amendment 15", "1870-02-03");
		documents.add("Amendment 16", "1913-02-03");
		documents.add("Amendment 17", "1913-04-08");
		documents.add("Amendment 18", "1919-01-16");
		documents.add("Amendment 19", "1920-08-18");
		documents.add("Amendment 20", "1933-01-23");
		documents.add("Amendment 21", "1933-12-05");
		documents.add("Amendment 22", "1951-02-27");
		documents.add("Amendment 23", "1961-03-29");
		documents.add("Amendment 24", "1964-01-23");
		documents.add("Amendment 25", "1967-02-10");
		documents.add("Amendment 26", "1971-07-01");
		documents.add("Amendment 27", "1992-05-05");
		return documents;
	}

	private Documents(Path srcDir, Path dstDir) {
		super(srcDir, dstDir);
	}

	private void add(String title, String date) throws NoSuchAlgorithmException, IOException {
		add(title, date, "ratified", Foundation.KIND_DOCUMENT);
	}

	@Override
	protected DocumentFactContent factToContent(Fact fact) {
		DocumentFactContent content = new DocumentFactContent();
		String input = read(slugify(fact.title) + ".foundation.html");
		content.components = FoundationParser.toComponents(input);
		return content;
	}
}
