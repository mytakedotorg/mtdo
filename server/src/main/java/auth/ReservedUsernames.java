/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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

			url(Routes.SEARCH),
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
