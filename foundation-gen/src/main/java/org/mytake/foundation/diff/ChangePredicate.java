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
import java.util.Objects;
import java.util.function.Function;

/** An interface for determining if two elements should be matched. */
@FunctionalInterface
public interface ChangePredicate<T> {
	/** Returns true if the given elements match. */
	boolean test(T before, T after);

	/** Default method which unpacks a change. */
	default boolean test(Change<T> change) {
		Preconditions.checkArgument(change.type().isBothPresent());
		return test(change.before(), change.after());
	}

	default boolean test(Match<T> match) {
		return test(match.before(), match.after());
	}

	/** Returns a Matcher which applies the given function to transform its inputs before it takes place. */
	default <V> ChangePredicate<V> compose(Function<? super V, ? extends T> func) {
		return (V before, V after) -> {
			T beforePrime = func.apply(before);
			T afterPrime = func.apply(after);
			return test(beforePrime, afterPrime);
		};
	}

	/** Returns a Matcher which applies the given function to transform its inputs before it takes place. */
	default <V> ChangePredicate<V> compose(Function<? super V, ? extends T> beforeFunc, Function<? super V, ? extends T> afterFunc) {
		return (V before, V after) -> {
			T beforePrime = beforeFunc.apply(before);
			T afterPrime = afterFunc.apply(after);
			return test(beforePrime, afterPrime);
		};
	}

	/** Returns a ChangePredicate which negates this one. */
	default ChangePredicate<T> negate() {
		return (before, after) -> !test(before, after);
	}

	/** Returns a short-circuiting logical or. */
	default ChangePredicate<T> or(ChangePredicate<? super T> other) {
		return (before, after) -> test(before, after) || other.test(before, after);
	}

	/** Returns a short-circuiting logical and. */
	default ChangePredicate<T> and(ChangePredicate<? super T> other) {
		return (before, after) -> test(before, after) && other.test(before, after);
	}

	/** Returns a Matcher that uses .equals() for comparison. */
	public static <T> ChangePredicate<T> equals() {
		return Objects::equals;
	}

	/** Returns a Matcher that uses identity for comparison. */
	public static <T> ChangePredicate<T> identity() {
		return (before, after) -> before == after;
	}

	/** Returns a Matcher that always returns true. */
	public static <T> ChangePredicate<T> always() {
		return (before, after) -> true;
	}

	/** Returns a Matcher that always returns false. */
	public static <T> ChangePredicate<T> never() {
		return (before, after) -> false;
	}
}
