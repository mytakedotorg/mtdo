/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

import java.util.List;

public interface Search {
	@jsweet.lang.Interface
	public class Request {
		public String q;
	}

	@jsweet.lang.Interface
	public class FactResult implements Json {
		public String hash;
	}

	@jsweet.lang.Interface
	public class VideoResult extends FactResult {
		public int turn;
	}

	@jsweet.lang.Interface
	public class FactResultList implements Json {
		public List<VideoResult> facts;
	}
}
