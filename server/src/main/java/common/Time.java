/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import java.sql.Date;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

/** Abstracts access to time, so we can control it for testing. */
public interface Time {
	long nowMs();

	default AddableDate nowDate() {
		return new AddableDate(nowMs());
	}

	default AddableTimestamp nowTimestamp() {
		return new AddableTimestamp(nowMs());
	}

	default boolean isBeforeNowPlus(java.util.Date date, int duration, TimeUnit unit) {
		return isBeforeNowPlus(date.getTime(), duration, unit);
	}

	default boolean isBeforeNowPlus(long time, int duration, TimeUnit unit) {
		long mustBeBefore = nowMs() + unit.toMillis(duration);
		return time < mustBeBefore;
	}

	/** A Timestamp that supports `plus` and `minus`. */
	static class AddableTimestamp extends Timestamp {
		private static final long serialVersionUID = -5087596357768273865L;

		public AddableTimestamp(long time) {
			super(time);
		}

		public AddableTimestamp plus(long duration, TimeUnit timeUnit) {
			return new AddableTimestamp(getTime() + timeUnit.toMillis(duration));
		}

		public AddableTimestamp minus(long duration, TimeUnit timeUnit) {
			return new AddableTimestamp(getTime() - timeUnit.toMillis(duration));
		}
	}

	/** A Date that supports `plus` and `minus`. */
	static class AddableDate extends Date {
		private static final long serialVersionUID = 7583328505217059642L;

		public AddableDate(long date) {
			super(date);
		}

		public AddableDate plus(long duration, TimeUnit timeUnit) {
			return new AddableDate(getTime() + timeUnit.toMillis(duration));
		}

		public AddableDate minus(long duration, TimeUnit timeUnit) {
			return new AddableDate(getTime() - timeUnit.toMillis(duration));
		}
	}

	/** Makes a Timestamp addable. */
	public static AddableTimestamp addable(Timestamp timestamp) {
		if (timestamp instanceof AddableTimestamp) {
			return (AddableTimestamp) timestamp;
		} else {
			return new AddableTimestamp(timestamp.getTime());
		}
	}

	/** Makes a Date addable. */
	public static AddableDate addable(Date timestamp) {
		if (timestamp instanceof AddableDate) {
			return (AddableDate) timestamp;
		} else {
			return new AddableDate(timestamp.getTime());
		}
	}

	/** January 1, 1970 */
	public static DateFormat formatLong() {
		return setTZ(new SimpleDateFormat("MMMM d, yyyy", Locale.ROOT));
	}

	/** Jan 01 1970 */
	public static DateFormat formatCompact() {
		return setTZ(new SimpleDateFormat("MMM dd yyyy", Locale.ROOT));
	}

	static DateFormat setTZ(DateFormat dateFormat) {
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
		return dateFormat;
	}
}
