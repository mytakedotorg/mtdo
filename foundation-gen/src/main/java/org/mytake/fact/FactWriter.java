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
package org.mytake.fact;


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
