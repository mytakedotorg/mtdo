/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

@jsweet.lang.Interface
public class VideoBlock {
	public StringTypes.video kind;
	public String videoId;
	@jsweet.lang.Optional
	public jsweet.util.tuple.Tuple2<Integer, Integer> range;
}
