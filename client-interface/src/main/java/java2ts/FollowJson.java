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
 * You can contact us at team@mytake.org
 */
package java2ts;

public interface FollowJson {
	/** Request when a take/profile is first viewed. */
	@jsweet.lang.Interface
	public class FollowAskReq implements Json {
		public String username;
	}

	/** Request to follow/unfollow a user. */
	@jsweet.lang.Interface
	public class FollowTellReq implements Json {
		public String username;
		public boolean isFollowing;
	}

	/** Response to both requests. */
	@jsweet.lang.Interface
	public class FollowRes implements Json {
		public boolean isFollowing;
	}
}
