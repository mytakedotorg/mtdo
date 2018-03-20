/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.diff;

/*
 * LICENSE ABOVE IS INCORRECT, BUT REQUIRED BY AUTO-FORMATTER.
 * 
 * This code is copyright 2018 by DiffPlug, LLC.  It is made available under the Apache 2.0
 * license.  It will be released as opensource by DiffPlug, LLC in the near future, at which point
 * this code will be removed from the MyTake.org codebase.
 */

import com.diffplug.common.base.Unhandled;
import javax.annotation.Nullable;

/** Represents the two sides of a change. */
public enum Side {
	BEFORE, AFTER;

	/** Returns the other side. */
	public Side other() {
		switch (this) {
		case BEFORE:
			return AFTER;
		case AFTER:
			return BEFORE;
		default:
			throw Unhandled.enumException(this);
		}
	}

	/** Returns either before or after based on the given side. */
	public <T> T get(@Nullable T before, @Nullable T after) {
		switch (this) {
		case BEFORE:
			return before;
		case AFTER:
			return after;
		default:
			throw Unhandled.enumException(this);
		}
	}
}
