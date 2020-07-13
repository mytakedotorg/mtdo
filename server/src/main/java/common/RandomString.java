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

import java.util.Base64;
import java.util.Random;

public class RandomString {
	public static final int FORTY_FOUR = 44;

	/** Returns a URL-safe random string of the given length.  Best if the length is divisible by 4. */
	public static String get(Random random, int length) {
		int numBytes = 3 * length / 4;
		byte[] bytes = new byte[numBytes];
		random.nextBytes(bytes);
		return Base64.getUrlEncoder().encodeToString(bytes);
	}
}
