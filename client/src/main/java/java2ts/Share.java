/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

public interface Share {
	public static final String METHOD_URL = "url";
	public static final String METHOD_FACEBOOK = "facebook";
	public static final String METHOD_TWITTER = "twitter";

	/** When someone shares a clip or an excerpt. */
	@jsweet.lang.Interface
	public class ShareReq implements Json {
		public String title;
		public String method;
		public String factSlug;
		public jsweet.util.tuple.Tuple2<String, String> highlightedRange;
		@jsweet.lang.Optional
		public jsweet.util.tuple.Tuple2<String, String> viewRange;
	}
}
