/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
