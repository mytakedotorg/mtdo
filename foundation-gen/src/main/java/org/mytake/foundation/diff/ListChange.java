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
import com.diffplug.common.collect.Range;
import java.util.List;
import java.util.stream.IntStream;

/** Represents a contiguous chunk of changes in a list. */
public interface ListChange {
	/** Returns the type of this change. */
	ChangeType getType();

	/** The start of the before side (inclusive). */
	int getBeforeStart();

	/** The end of the before side (exclusive). */
	int getBeforeEnd();

	/** The start of the after side (inclusive). */
	int getAfterStart();

	/** The end of the after side (exclusive). */
	int getAfterEnd();

	/** The length of the before side. */
	default int getBeforeLength() {
		return getBeforeEnd() - getBeforeStart();
	}

	/** The length of the after side. */
	default int getAfterLength() {
		return getAfterEnd() - getAfterStart();
	}

	/** The start of the given side. */
	default int getStart(Side side) {
		switch (side) {
		case BEFORE:
			return getBeforeStart();
		case AFTER:
			return getAfterStart();
		default:
			throw Unhandled.enumException(side);
		}
	}

	/** The end of the given side. */
	default int getEnd(Side side) {
		switch (side) {
		case BEFORE:
			return getBeforeEnd();
		case AFTER:
			return getAfterEnd();
		default:
			throw Unhandled.enumException(side);
		}
	}

	/** The length of the given side. */
	default int getLength(Side side) {
		return getEnd(side) - getStart(side);
	}

	/** The given side as a Range<Integer>. */
	default Range<Integer> getRange(Side side) {
		return Range.closedOpen(getStart(side), getEnd(side));
	}

	/** Returns an IntStream over the indices of the given side. */
	default IntStream getIndices(Side side) {
		return IntStream.range(getStart(side), getEnd(side));
	}

	/** Returns a sublist of the given list, using the start and end indices of the given side. */
	default <T> List<T> subList(List<T> list, Side side) {
		return list.subList(getStart(side), getEnd(side));
	}

	/** Returns a sublist of the given list, using the start and end indices of the given side. */
	default <T> List<T> subList(Match<List<T>> list, Side side) {
		return subList(list.get(side), side);
	}

	/** Returns a sublist of the given list, using the start and end indices of the given side. */
	default <T> List<T> subList(Change<List<T>> list, Side side) {
		return subList(list.get(side), side);
	}

	/** Returns a sublist of the given string, using the start and end indices of the given side. */
	default <T> String substring(String list, Side side) {
		return list.substring(getStart(side), getEnd(side));
	}

	/** Returns a sublist of the given string, using the start and end indices of the given side. */
	default <T> String substring(Match<String> list, Side side) {
		return substring(list.get(side), side);
	}

	/** Returns a sublist of the given string, using the start and end indices of the given side. */
	default <T> String substring(Change<String> list, Side side) {
		return substring(list.get(side), side);
	}

	/** Returns the inverse change of this one. */
	default ListChange getInverse() {
		if (this instanceof Inverse) {
			// inverse of an inverse is ourselves
			return ((Inverse) this).source;
		} else {
			// return an wrapping inverter
			return new Inverse(this);
		}
	}

	/** An implementation of Mapping which inverts another. */
	static class Inverse implements ListChange {
		private final ListChange source;

		Inverse(ListChange source) {
			this.source = source;
		}

		@Override
		public ChangeType getType() {
			return source.getType();
		}

		@Override
		public int getBeforeStart() {
			return source.getAfterStart();
		}

		@Override
		public int getBeforeEnd() {
			return source.getAfterEnd();
		}

		@Override
		public int getAfterStart() {
			return source.getBeforeStart();
		}

		@Override
		public int getAfterEnd() {
			return source.getBeforeEnd();
		}

		@Override
		public String toString() {
			return "[INVERSE] " + source.toString();
		}
	}

	/** Creates a ListChange with the given before range, then after range. */
	public static ListChange create(ChangeType type, int beforeStart, int beforeEnd, int afterStart, int afterEnd) {
		return new Default(type, beforeStart, beforeEnd, afterStart, afterEnd);
	}

	/** Creates a toString() implementation for the given ListChange. */
	public static String toString(ListChange change) {
		return change.getType() + " " +
				change.getBeforeStart() + "-" + change.getBeforeEnd() + ":" +
				change.getAfterStart() + "-" + change.getAfterEnd() + " " +
				change.getClass().getName();
	}

	/** A default implementation of a Change. */
	public static class Default implements ListChange {
		private final ChangeType type;
		private final int beforeStart, beforeEnd;
		private final int afterStart, afterEnd;

		protected Default(ChangeType type, int beforeStart, int beforeEnd, int afterStart, int afterEnd) {
			this.type = type;
			this.beforeStart = beforeStart;
			this.beforeEnd = beforeEnd;
			this.afterStart = afterStart;
			this.afterEnd = afterEnd;
		}

		@Override
		public ChangeType getType() {
			return type;
		}

		@Override
		public int getBeforeStart() {
			return beforeStart;
		}

		@Override
		public int getBeforeEnd() {
			return beforeEnd;
		}

		@Override
		public int getAfterStart() {
			return afterStart;
		}

		@Override
		public int getAfterEnd() {
			return afterEnd;
		}

		@Override
		public String toString() {
			return ListChange.toString(this);
		}
	}

	/** A Change which is guaranteed to be CHANGED, and is derived from another. */
	static class ChangedChange<T> extends Change.Abstract<T> {
		@Override
		public ChangeType type() {
			return ChangeType.CHANGED;
		}

		private final Change<T> source;

		public ChangedChange(Change<T> source) {
			this.source = source;
		}

		@Override
		public T before() {
			return source.before();
		}

		@Override
		public T after() {
			return source.after();
		}
	}
}
