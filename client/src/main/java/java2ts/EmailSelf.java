/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

import com.jsoniter.any.Any;

@jsweet.lang.Interface
public class EmailSelf implements Json {
	public String subject;
	public String body;
	public Any cidMap;
}
