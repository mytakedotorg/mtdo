/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Loads every line in a file, and stuffs them into a set.
 * `;` lines are treated as comments, just like an ini.
 */
class SetIni {
	public static Set<String> parse(File file) throws IOException {
		return parse(file.toPath());
	}

	public static Set<String> parse(Path path) throws IOException {
		if (!Files.exists(path)) {
			throw new IllegalArgumentException("Does not exist: " + path);
		}
		List<String> lines = Files.readAllLines(path);
		Set<String> result = new HashSet<>(lines.size());
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
