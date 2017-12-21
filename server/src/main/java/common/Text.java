/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
