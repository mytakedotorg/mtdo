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
import com.diffplug.common.collect.Lists;
import java.util.List;
import java.util.function.Function;
import java.util.function.ToIntFunction;
import org.eclipse.jgit.diff.DiffAlgorithm;
import org.eclipse.jgit.diff.Edit;
import org.eclipse.jgit.diff.EditList;
import org.eclipse.jgit.diff.Sequence;
import org.eclipse.jgit.diff.SequenceComparator;

/** Converts JGit's diff algorithms for use in DiffPlug. */
public class JGitListDiffer {
	/** The "mathematically" best diff. */
	public static <T> JGitListDiffer myersDiff() {
		DiffAlgorithm algorithm = DiffAlgorithm.getAlgorithm(DiffAlgorithm.SupportedAlgorithm.MYERS);
		return new JGitListDiffer(algorithm);
	}

	/** Usually the "intuitively" best diff. */
	public static <T> JGitListDiffer histogramDiff() {
		DiffAlgorithm algorithm = DiffAlgorithm.getAlgorithm(DiffAlgorithm.SupportedAlgorithm.HISTOGRAM);
		return new JGitListDiffer(algorithm);
	}

	private final DiffAlgorithm algorithm;

	public JGitListDiffer(DiffAlgorithm algorithm) {
		this.algorithm = algorithm;
	}

	/** Diffs the given objects. */
	public <T> List<ListChange> diff(List<T> before, List<T> after) {
		return diffOn(before, after, Function.identity());
	}

	/** Performs a diff on the given lists, matching based on the result of the given function. */
	public <T> List<ListChange> diffOn(List<T> before, List<T> after, Function<T, ?> matchOn) {
		return diff(before, after, ChangePredicate.equals().compose(matchOn), o -> matchOn.apply(o).hashCode());
	}

	/** Performs a diff on the given lists, using the given functions to match and hash. */
	public <T> List<ListChange> diff(List<T> before, List<T> after, ChangePredicate<T> matcher, ToIntFunction<T> hasher) {
		// wrap our inputs in the JGit way
		ListSequenceComparator<T> comparator = new ListSequenceComparator<T>(matcher, hasher);
		ListSequence<T> a = new ListSequence<T>(before);
		ListSequence<T> b = new ListSequence<T>(after);

		EditList editList = algorithm.diff(comparator, a, b);
		return editsToListChanges(editList, before.size(), after.size());
	}

	/** Makes a ListChange from an Edit. Edits only represent edits (not identicals), so it's only a partial solution for us. */
	private static class ListChangeFromEdit implements ListChange {
		private final Edit edit;
		private final ChangeType type;

		public ListChangeFromEdit(Edit edit) {
			this.edit = edit;
			ChangeType type;
			switch (edit.getType()) {
			case INSERT:
				type = ChangeType.ADDED;
				break;
			case DELETE:
				type = ChangeType.REMOVED;
				break;
			case REPLACE:
				type = ChangeType.CHANGED;
				break;
			case EMPTY: // we can't handle EMPTY elements
			default:
				throw Unhandled.enumException(edit.getType());
			}
			this.type = type;
		}

		@Override
		public ChangeType getType() {
			return type;
		}

		@Override
		public int getBeforeStart() {
			return edit.getBeginA();
		}

		@Override
		public int getBeforeEnd() {
			return edit.getEndA();
		}

		@Override
		public int getAfterStart() {
			return edit.getBeginB();
		}

		@Override
		public int getAfterEnd() {
			return edit.getEndB();
		}

		@Override
		public String toString() {
			return ListChange.toString(this);
		}
	}

	/** Sequence adapter. */
	private static class ListSequence<T> extends Sequence {
		private final List<T> list;

		public ListSequence(List<T> list) {
			this.list = list;
		}

		@Override
		public int size() {
			return list.size();
		}
	}

	/** SequenceComparator adapter. */
	private static class ListSequenceComparator<T> extends SequenceComparator<ListSequence<T>> {
		private final ChangePredicate<T> matcher;
		private final ToIntFunction<T> hasher;

		public ListSequenceComparator(ChangePredicate<T> matcher, ToIntFunction<T> hasher) {
			this.matcher = matcher;
			this.hasher = hasher;
		}

		@Override
		public boolean equals(ListSequence<T> a, int ai, ListSequence<T> b, int bi) {
			return matcher.test(a.list.get(ai), b.list.get(bi));
		}

		@Override
		public int hash(ListSequence<T> seq, int ptr) {
			return hasher.applyAsInt(seq.list.get(ptr));
		}
	}

	/** Converts a List<Edit> (which only contains changes) to a List<ListChange> (which spans the entire list. */
	public static List<ListChange> editsToListChanges(List<Edit> editList, int beforeSize, int afterSize) {
		List<ListChange> changes = Lists.newArrayListWithCapacity(2 * editList.size() + 1);
		int beforeIdx = 0;
		int afterIdx = 0;
		for (Edit edit : editList) {
			// skip the empty ones
			if (edit.isEmpty()) {
				continue;
			}

			boolean beforeMatches = beforeIdx == edit.getBeginA();
			boolean afterMatches = afterIdx == edit.getBeginB();
			Preconditions.checkState(beforeMatches == afterMatches, "Either we need to insert one or we don't.");

			if (!beforeMatches) {
				// if they don't match, we need to insert an identical ListChange
				changes.add(ListChange.create(ChangeType.IDENTICAL, beforeIdx, edit.getBeginA(), afterIdx, edit.getBeginB()));
			}
			// now we'll wrap the edit
			changes.add(new ListChangeFromEdit(edit));
			beforeIdx = edit.getEndA();
			afterIdx = edit.getEndB();
		}

		boolean beforeMatches = beforeIdx == beforeSize;
		boolean afterMatches = afterIdx == afterSize;
		Preconditions.checkState(beforeMatches == afterMatches, "Either we need to insert one or we don't.");
		if (!beforeMatches) {
			// create a last edit for the case of an empty editlist
			Edit lastEdit = editList.isEmpty() ? new Edit(0, 0) : editList.get(editList.size() - 1);
			// insert the trailing identical ListChange
			changes.add(ListChange.create(ChangeType.IDENTICAL, lastEdit.getEndA(), beforeSize, lastEdit.getEndB(), afterSize));
		}
		// create a ListChanges from the converted before / after / changes
		return changes;
	}
}
