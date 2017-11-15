/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import common.RedirectException;
import common.Text;
import controllers.AboutUs;
import controllers.Foundation;

/** Usernames that we reserve for ourselves, for routing or other reasons. */
class ReservedUsernames {
	static boolean isReserved(String username) {
		return RESERVED_USERNAMES.contains(username);
	}

	private static final ImmutableSet<String> RESERVED_USERNAMES = ImmutableSet.of(
			"drafts",			// drafts
			"import",			// import from e.g. Google docs?
			"api",				// for api access
			"settings",			// for user settings
			url(Foundation.URL),	// for serving evidence
			"blog",				// for a blog
			url(AboutUs.URL),	// for us
			"legal",				// for legal attributes
			url(AuthModule.URL_login),
			url(AuthModule.URL_logout),
			url(AuthModule.URL_confirm),
			url(RedirectException.Module.URL_notFound),
			url(RedirectException.Module.URL_badRequest));

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
