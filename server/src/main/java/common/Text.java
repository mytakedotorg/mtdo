/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
package common;

import java.util.Locale;
import org.jooby.Request;

/** Utility methods for text. */
public class Text {
	/** Returns the given param, lowercased. */
	public static String lowercase(Request req, String param) {
		return lowercase(req.param(param).value());
	}

	/** Lowercases the given input. */
	public static String lowercase(String input) {
		return input.toLowerCase(Locale.ROOT);
	}

	/** Slugify. */
	public static String slugify(String input) {
		String lowercase = lowercase(input);
		return lowercase.replace(' ', '-') // replace spaces with hyphens
				.replaceAll("[-]+", "-") // replace multiple hypens with a single hyphen
				.replaceAll("[^\\w-]+", ""); // replace non-alphanumerics and non-hyphens
	}
}
