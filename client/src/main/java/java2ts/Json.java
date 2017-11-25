/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

import com.jsoniter.output.JsonStream;

/** Marker interface so JsoniterModule can know that an object is Json. */
@jsweet.lang.Interface
public interface Json {
	@jsweet.lang.Erased
	default String toJson() {
		return JsonStream.serialize(this);
	}
}
