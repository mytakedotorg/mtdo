/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

@jsweet.lang.Interface
public class PublishResult implements Json {
	public String publishedUrl;
	public boolean conflict;
}
