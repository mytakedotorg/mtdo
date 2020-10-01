/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.factset.video;


import com.diffplug.common.base.Preconditions;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Loads every line in a file, and stuffs them into a set.
 * `;` lines are treated as comments, just like an ini.
 */
public class SetStoredAsIni {
	public static Set<String> parse(File file) throws IOException {
		return parse(file.toPath());
	}

	public static Set<String> parse(Path path) throws IOException {
		if (!Files.exists(path)) {
			throw new IllegalArgumentException("Does not exist: " + path);
		}
		return parse(path, new String(Files.readAllBytes(path), StandardCharsets.UTF_8));
	}

	public static Set<String> parse(Path path, String content) throws IOException {
		List<String> lines = Arrays.asList(content.replace("\r", "").split("\n"));
		Set<String> result = new LinkedHashSet<>(lines.size());
		for (int i = 0; i < lines.size(); ++i) {
			String line = lines.get(i);
			if (line.startsWith(";")) {
				continue;
			}
			if (line.trim().equals(line)) {
				// handle "" for names like O'Brien
				if (line.startsWith("\"") && line.endsWith("\"")) {
					line = line.substring(1, line.length() - 1);
				}
				boolean wasAdded = result.add(line);
				Preconditions.checkArgument(wasAdded, "On line " + (i + 1) + " of " + path + ": duplicate");
			} else {
				throw new IllegalArgumentException("On line " + (i + 1) + " of " + path + ": illegal whitespace, probably trailing");
			}
		}
		return result;
	}
}
