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
import com.diffplug.common.collect.ImmutableList;
import com.diffplug.common.collect.ImmutableSet;
import java.util.List;
import java.util.Set;

/** The 4 ways that an element can change. */
public enum ChangeType {
	ADDED, REMOVED, CHANGED, IDENTICAL;

	/** Returns true iff this ChangeType is identical. */
	public boolean isIdentical() {
		return this == IDENTICAL;
	}

	private static final ImmutableList<ChangeType> NOT_IDENTICAL = ImmutableList.of(ADDED, REMOVED, CHANGED);

	/** Returns all ChangeType which are not identical. */
	public static List<ChangeType> notIdentical() {
		return NOT_IDENTICAL;
	}

	/** Return a bit-mask for this ChangeType. */
	public int mask() {
		switch (this) {
		case ADDED:
			return 0x01;
		case REMOVED:
			return 0x02;
		case CHANGED:
			return 0x04;
		case IDENTICAL:
			return 0x00;
		default:
			throw Unhandled.enumException(this);
		}
	}

	/** Returns the only side which contains a value, or throws an exception if both sides contain a value. */
	public Side onlySide() {
		switch (this) {
		case ADDED:
			return Side.AFTER;
		case REMOVED:
			return Side.BEFORE;
		default:
			throw Unhandled.enumException(this);
		}
	}

	@SuppressWarnings("unchecked")
	private static final ImmutableSet<ChangeType>[] values = new ImmutableSet[]{
			ImmutableSet.of(),
			ImmutableSet.of(ADDED),
			ImmutableSet.of(REMOVED),
			ImmutableSet.of(ADDED, REMOVED),
			ImmutableSet.of(CHANGED),
			ImmutableSet.of(ADDED, CHANGED),
			ImmutableSet.of(REMOVED, CHANGED),
			ImmutableSet.of(ADDED, REMOVED, CHANGED)
	};

	/** Returns the kinds of ChangeType which are encoded in the given Set. */
	public static Set<ChangeType> fromMask(int mask) {
		return values[mask];
	}

	/** Returns the mask which signifies all elements. */
	public static int maskAll() {
		return 0x07;
	}

	/** Returns the mask which signifies all elements. */
	public static int maskNone() {
		return 0x00;
	}

	/** Returns the inverse type to this one. */
	public ChangeType getInverse() {
		switch (this) {
		case ADDED:
			return REMOVED;
		case REMOVED:
			return ADDED;
		case CHANGED:
		case IDENTICAL:
			return this;
		default:
			throw Unhandled.enumException(this);
		}
	}

	/** Returns true iff before is present. */
	public boolean isBothPresent() {
		switch (this) {
		case ADDED:
		case REMOVED:
			return false;
		case CHANGED:
		case IDENTICAL:
			return true;
		default:
			throw Unhandled.enumException(this);
		}
	}

	/** Returns true iff before is present. */
	public boolean isBeforePresent() {
		switch (this) {
		case ADDED:
			return false;
		case REMOVED:
		case CHANGED:
		case IDENTICAL:
			return true;
		default:
			throw Unhandled.enumException(this);
		}
	}

	/** Returns true iff after is present. */
	public boolean isAfterPresent() {
		switch (this) {
		case REMOVED:
			return false;
		case ADDED:
		case CHANGED:
		case IDENTICAL:
			return true;
		default:
			throw Unhandled.enumException(this);
		}
	}
}
