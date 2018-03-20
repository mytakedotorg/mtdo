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

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.Unhandled;
import com.diffplug.common.collect.ImmutableList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.function.Function;
import javax.annotation.Nullable;

/** Represents a directed change. */
public interface Change<T> {
	/** Returns the type of this change. */
	ChangeType type();

	/** Returns the before side of the change. MUST NOT BE CALLED UNLESS IT EXISTS. */
	T before();

	/** Returns the after side of the change. MUST NOT BE CALLED UNLESS IT EXISTS. */
	T after();

	/** Returns before if it exists, else returns after. */
	default T first() {
		if (type().isBeforePresent()) {
			return before();
		} else {
			return after();
		}
	}

	/** Returns after if it exists, else returns before. */
	default T last() {
		if (type().isAfterPresent()) {
			return after();
		} else {
			return before();
		}
	}

	/** Returns the given side of the Change, wrapped in an Optional. */
	default Optional<T> getOpt(Side side) {
		return Optional.ofNullable(getNullable(side));
	}

	/** Returns the given side of the Change, wrapped in an Optional. */
	@Nullable
	default T getNullable(Side side) {
		switch (side) {
		case BEFORE:
			if (type().isBeforePresent()) {
				return before();
			} else {
				return null;
			}
		case AFTER:
			if (type().isAfterPresent()) {
				return after();
			} else {
				return null;
			}
		default:
			throw Unhandled.enumException(side);
		}
	}

	/** Returns the given side of the Change, wrapped in an Optional. */
	default T get(Side side) {
		switch (side) {
		case BEFORE:
			return before();
		case AFTER:
			return after();
		default:
			throw Unhandled.enumException(side);
		}
	}

	default Match<T> toMatch() {
		Preconditions.checkState(type().isBothPresent());
		return Match.create(before(), after());
	}

	/** Applies the given function to both sides of the change. */
	default <R> Change<R> map(Function<T, R> function) {
		switch (type()) {
		case ADDED:
			return create(type(), null, function.apply(after()));
		case REMOVED:
			return create(type(), function.apply(before()), null);
		case CHANGED:
		case IDENTICAL:
			return create(type(), function.apply(before()), function.apply(after()));
		default:
			throw Unhandled.enumException(type());
		}
	}

	/** Applies the given consumer to each value in the change. */
	default void forEach(BiConsumer<Side, T> consumer) {
		switch (type()) {
		case ADDED:
			consumer.accept(Side.AFTER, after());
			break;
		case REMOVED:
			consumer.accept(Side.BEFORE, before());
			break;
		case CHANGED:
		case IDENTICAL:
			consumer.accept(Side.BEFORE, before());
			consumer.accept(Side.AFTER, after());
			break;
		default:
			throw Unhandled.enumException(type());
		}
	}

	/** Returns all of the values in this change as a list. */
	default List<T> asList() {
		switch (type()) {
		case ADDED:
			return ImmutableList.of(after());
		case REMOVED:
			return ImmutableList.of(before());
		case CHANGED:
		case IDENTICAL:
			return ImmutableList.of(before(), after());
		default:
			throw Unhandled.enumException(type());
		}
	}

	/** Creates a Change from the given type, before, and after. */
	public static <T> Change<T> create(ChangeType type, @Nullable T before, @Nullable T after) {
		return new Default<T>(type, before, after);
	}

	/** Creates an ADDED change. */
	public static <T> Change<T> added(T after) {
		return create(ChangeType.ADDED, null, after);
	}

	/** Creates a REMOVED change. */
	public static <T> Change<T> removed(T before) {
		return create(ChangeType.REMOVED, before, null);
	}

	/** Creates a CHANGED change. */
	public static <T> Change<T> changed(T before, T after) {
		return create(ChangeType.CHANGED, before, after);
	}

	/** Creates an IDENTICAL change. */
	public static <T> Change<T> identical(T before, T after) {
		return create(ChangeType.IDENTICAL, before, after);
	}

	/** A default implementation of a Change. */
	public static class Default<T> extends Abstract<T> {
		protected final ChangeType type;
		@Nullable
		protected final T before;
		@Nullable
		protected final T after;

		protected Default(ChangeType type, @Nullable T before, @Nullable T after) {
			if (type.isBeforePresent()) {
				Objects.requireNonNull(before);
			} else if (before != null) {
				throw new IllegalArgumentException("For " + type + ", before must be null, was " + before);
			}
			if (type.isAfterPresent()) {
				Objects.requireNonNull(after);
			} else if (after != null) {
				throw new IllegalArgumentException("For " + type + ", after must be null, was " + after);
			}

			this.type = type;
			this.before = before;
			this.after = after;
		}

		@Override
		public ChangeType type() {
			return type;
		}

		@Override
		public T before() {
			if (before != null) {
				return before;
			} else {
				throw new NoSuchElementException();
			}
		}

		@Override
		public T after() {
			if (after != null) {
				return after;
			} else {
				throw new NoSuchElementException();
			}
		}
	}

	/** Handles toString(), equals(), and hashCode(). */
	public static abstract class Abstract<T> implements Change<T> {
		@Override
		public String toString() {
			StringBuilder builder = new StringBuilder(256);
			builder.append(type().name());
			builder.append(' ');
			if (type().isBothPresent()) {
				builder.append(before().toString());
				builder.append(" -> ");
				builder.append(after().toString());
			} else {
				builder.append(first().toString());
			}
			return builder.toString();
		}

		@Override
		public boolean equals(Object otherObj) {
			if (otherObj instanceof Change) {
				Change<?> other = (Change<?>) otherObj;
				return type().equals(other.type()) && asList().equals(other.asList());
			} else {
				return false;
			}
		}

		@Override
		public int hashCode() {
			return Objects.hash(type(), asList());
		}
	}
}
