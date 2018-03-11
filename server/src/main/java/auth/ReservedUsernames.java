/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package auth;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import common.Text;
import java2ts.Routes;

/** Usernames that we reserve for ourselves, for routing or other reasons. */
class ReservedUsernames {
	static boolean isReserved(String username) {
		if (username.startsWith("foundation")) {
			return true;
		}
		return RESERVED_USERNAMES.contains(username);
	}

	private static final ImmutableSet<String> RESERVED_USERNAMES = ImmutableSet.of(
			"import",			// import from e.g. Google docs?
			"settings",			// for user settings
			"blog",				// for a blog
			"legal",				// for legal attributes
			url(Routes.API),
			url(Routes.MODS),
			url(Routes.DRAFTS),
			url(Routes.LOGIN),
			url(Routes.LOGOUT),
			url(AuthModule.URL_confirm),

			url(Routes.TIMELINE),
			url(Routes.FOUNDATION),
			url(Routes.FOUNDATION_DATA),

			url(Routes.ABOUT),
			url(Routes.PRIVACY),
			url(Routes.TERMS),
			url(Routes.TOS),
			url(Routes.FAQ),
			url(Routes.RULES));

	private static String url(String url) {
		Preconditions.checkArgument(url.startsWith("/"));
		int nextSlash = url.indexOf('/', 1);
		if (nextSlash == -1) {
			return Text.lowercase(url.substring(1));
		} else if (nextSlash == url.length() - 1) {
			return Text.lowercase(url.substring(1, nextSlash));
		} else {
			throw new IllegalArgumentException("Must be just /url/ or /url, was " + url);
		}
	}
}
