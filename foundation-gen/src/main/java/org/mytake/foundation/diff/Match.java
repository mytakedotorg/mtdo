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

import java.util.Objects;
import java.util.function.Function;

public final class Match<T> {
	public static <T> Match<T> create(T before, T after) {
		return new Match<>(before, after);
	}

	public static <T> Match<T> createPerSide(Function<Side, T> creator) {
		return create(creator.apply(Side.BEFORE), creator.apply(Side.AFTER));
	}

	private final T before, after;

	private Match(T before, T after) {
		this.before = Objects.requireNonNull(before);
		this.after = Objects.requireNonNull(after);
	}

	public T before() {
		return before;
	}

	public T after() {
		return after;
	}

	public T get(Side side) {
		return side.get(before, after);
	}

	@Override
	public boolean equals(Object otherObj) {
		if (otherObj == this) {
			return true;
		} else if (otherObj instanceof Match) {
			Match<?> other = (Match<?>) otherObj;
			return other.before.equals(before) && other.after.equals(after);
		} else {
			return false;
		}
	}

	@Override
	public int hashCode() {
		return before.hashCode() + 31 * after.hashCode();
	}

	@Override
	public String toString() {
		return before + " -> " + after;
	}
}
