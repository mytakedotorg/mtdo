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
		public String hStart;
		public String hEnd;
		@jsweet.lang.Optional
		public String docId;
		@jsweet.lang.Optional
		public String vidId;
		@jsweet.lang.Optional
		public String vStart;
		@jsweet.lang.Optional
		public String vEnd;
	}

	@jsweet.lang.Interface
	public class ShareRes implements Json {

	}
}
