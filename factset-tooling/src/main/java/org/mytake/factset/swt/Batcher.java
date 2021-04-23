/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.swt;


import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import org.jetbrains.annotations.Nullable;

/**
 * Batches several calls from anywhere into a single invocation
 * on the given executor. Prevents either side from blocking.
 */
class Batcher<T> {
	/** The executor which receives the batches. */
	private final Executor executor;
	/** The client. */
	private final Consumer<Collection<T>> client;
	/** Two pingpong lists of objects to update. */
	private final Collection<T> a, b;

	/** Creates a Batcher for the given Executor and the given Client. */
	public Batcher(Executor executor, Consumer<Collection<T>> client) {
		this.executor = executor;
		this.client = client;
		this.a = createCollection();
		this.b = createCollection();
	}

	/** True iff we are currently adding new objects to the "a" list. */
	private boolean aIsAdder = true;
	/** True iff an update has already been scheduled. */
	private final AtomicBoolean updatePending = new AtomicBoolean(false);

	private final Runnable swap = new Runnable() {
		@Override
		public void run() {
			// get the list to use for updating,
			// and set the pingpong to start using the other
			// list
			Collection<T> toUpdate;
			synchronized (updatePending) {
				toUpdate = aIsAdder ? a : b;
				aIsAdder = !aIsAdder;
			}

			// update each element
			client.accept(toUpdate);
			// mark everything as updated
			toUpdate.clear();

			// check to see if the other buffer
			// has had things added to it
			// while we've been working
			synchronized (updatePending) {
				toUpdate = aIsAdder ? a : b;
				if (toUpdate.isEmpty()) {
					// if not, mark that we're done
					updatePending.set(false);
				} else {
					// if things have been added,
					// then reschedule ourselves
					executor.execute(this);
				}
			}
		}
	};

	/** Adds an object to queue, and ensure that it will get batched with the next update. */
	public void addToQueue(@Nullable T obj) {
		synchronized (updatePending) {
			(aIsAdder ? a : b).add(obj);
		}

		if (updatePending.compareAndSet(false, true)) {
			executor.execute(swap);
		}
	}

	/** Called in the constructor to create the Lists used for the batcher. */
	protected Collection<T> createCollection() {
		return new ArrayList<>();
	}
}
