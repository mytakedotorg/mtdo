/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

import com.jsoniter.any.Any;

@jsweet.lang.Interface
public class Card {
	public String username;
	public String titleSlug;
	public String title;
	public Any blocks;
	public int[] previewBlocks;
}
