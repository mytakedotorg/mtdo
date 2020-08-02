/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.NoSuchAlgorithmException;
import java2ts.FT;
import java2ts.FT.DocumentFactContent;
import java2ts.FT.Fact;
import org.mytake.foundation.parsers.FoundationParser;

public class Documents {
	public static void national(FactWriter writer) throws NoSuchAlgorithmException, IOException {
		Documents documents = new Documents(writer);
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
	}

	private final FactWriter writer;

	private Documents(FactWriter writer) {
		this.writer = writer;
	}

	private void add(String title, String date) throws NoSuchAlgorithmException, IOException {
		add(title, date, "ratified", FT.KIND_DOCUMENT);
	}

	private void add(String title, String date, String dateKind, String kind) throws NoSuchAlgorithmException, IOException {
		DocumentFactContent content = new DocumentFactContent();
		content.fact = new Fact();
		content.fact.title = title;
		content.fact.primaryDate = date;
		content.fact.primaryDateKind = dateKind;
		content.fact.kind = kind;

		// load the components
		String input = read(FactWriter.slugify(content.fact.title) + ".foundation.html");
		content.components = FoundationParser.toComponents(input);

		writer.writeAndReturnHash(content);
	}

	private String read(String name) throws IOException {
		return new String(Files.readAllBytes(Folders.SRC_DOCUMENT.resolve(name)), StandardCharsets.UTF_8);
	}
}
