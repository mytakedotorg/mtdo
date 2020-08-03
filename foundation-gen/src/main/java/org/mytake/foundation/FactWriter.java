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
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java2ts.FT;
import java2ts.FT.FactLink;

public class FactWriter {
	final List<FactLink> factLinks = new ArrayList<>();
	final Path dstDir;

	public FactWriter(Path dstDir) throws IOException {
		this.dstDir = dstDir;
		Files.createDirectories(dstDir);
	}

	protected static String slugify(String input) {
		return input.toLowerCase(Locale.ROOT)
				.replace(' ', '-') // replace spaces with hyphens
				.replaceAll("[-]+", "-") // replace multiple hypens with a single hyphen
				.replaceAll("[^\\w-]+", ""); // replace non-alphanumerics and non-hyphens
	}

	public String writeAndReturnHash(FT.FactContent content) throws IOException, NoSuchAlgorithmException {
		Hashed hashed = Hashed.asJson(content);
		Files.write(dstDir.resolve(hashed.hash + ".json"), hashed.content);

		FactLink link = new FactLink();
		link.fact = content.fact;
		link.hash = hashed.hash;
		factLinks.add(link);
		return link.hash;
	}

	public Hashed hashedFactLinks() throws NoSuchAlgorithmException {
		return Hashed.asJson(factLinks);
	}
}
