/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
