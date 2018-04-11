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
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java2ts.Foundation;
import java2ts.Foundation.FactLink;

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

	public String writeAndReturnHash(Foundation.FactContent content) throws IOException, NoSuchAlgorithmException {
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
