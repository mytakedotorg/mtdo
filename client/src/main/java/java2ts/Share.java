/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

public interface Share {
	/** When someone shares a clip or an excerpt. */
	@jsweet.lang.Interface
	public class ShareReq implements Json {
		public String title;
		public String method;
		public String factSlug;
		public String highlightedRangeStart;
		public String highlightedRangeEnd;
		@jsweet.lang.Optional
		public String viewRangeStart;
		@jsweet.lang.Optional
		public String viewRangeEnd;
	}

	@jsweet.lang.Interface
	public class ShareRes implements Json {

	}
}
