/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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

import org.jooby.Result;
import org.jooby.Results;

/** Sends a response with cache-headers which guarantee forever-immutability. */
public class Cloudflare {
	public static Result json(Object toSend) {
		return Results.json(toSend)
				.header("Cache-Control",
						"max-age=31536000", // one year https://stackoverflow.com/a/25201898/1153071
						"public", // any cache may store the response
						"no-transform", // don't muck with it at all
						"immutable" // it will never change at all for sure
				);
	}
}
