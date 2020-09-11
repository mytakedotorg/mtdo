/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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

public interface TakeReactionJson {
	/** The number of views, likes, and bookmarks for the given take. */
	@jsweet.lang.Interface
	public class TakeState implements Json {
		public int viewCount, likeCount;
	}

	/** Determines whether the logged-in user has taken any of the given actions. */
	@jsweet.lang.Interface
	public class UserState implements Json {
		public boolean like, bookmark, spam, harassment, rulesviolation;
	}

	/** Request when a take is first viewed. */
	@jsweet.lang.Interface
	public class ViewReq implements Json {
		public int take_id;
	}

	@jsweet.lang.Interface
	public class ViewRes implements Json {
		public TakeState takeState;
		@jsweet.lang.Optional
		public UserState userState;
	}

	/** Request when a take is reacted to in some way. */
	@jsweet.lang.Interface
	public class ReactReq implements Json {
		public int take_id;
		public UserState userState;
	}

	@jsweet.lang.Interface
	public class ReactRes implements Json {
		public TakeState takeState;
		public UserState userState;
	}
}
