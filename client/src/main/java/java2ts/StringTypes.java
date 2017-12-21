/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

@jsweet.lang.Erased
public interface StringTypes {
	// ParagraphBlock / DocumentBlock / VideoBlock
	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface paragraph {}

	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface document {}

	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface video {}

	// DocumentFact
	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface ratified {}

	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface published {}

	// VideoFact
	@jsweet.lang.StringType
	@jsweet.lang.Erased
	public interface recorded {}

}
