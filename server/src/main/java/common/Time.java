/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
 * You can contact us at team@mytake.org
 */
package common;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

/** Abstracts access to time, so we can control it for testing. */
public interface Time {
	long nowMs();

	default LocalDateTime now() {
		return LocalDateTime.ofInstant(Instant.ofEpochMilli(nowMs()), ZoneOffset.UTC);
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

	/** 1970-01-01 */
	public static DateFormat formatHTML() {
		return setTZ(new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT));
	}

	static DateFormat setTZ(DateFormat dateFormat) {
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
		return dateFormat;
	}

	public static LocalDateTime parseIso(String str) {
		return LocalDateTime.from(Instant.parse(str));
	}

	public static String toIso(LocalDateTime timestamp) {
		return OffsetDateTime.of(timestamp, ZoneOffset.UTC).toString();
	}

	public static LocalDateTime parseGMT(String str) {
		return LocalDateTime.from(DateTimeFormatter.RFC_1123_DATE_TIME.parse(str));
	}

	public static String toGMT(LocalDateTime timestamp) {
		return DateTimeFormatter.RFC_1123_DATE_TIME.format(timestamp.atOffset(ZoneOffset.UTC));
	}

	public static Date toDate(LocalDateTime dateTime) {
		return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
	}
}
