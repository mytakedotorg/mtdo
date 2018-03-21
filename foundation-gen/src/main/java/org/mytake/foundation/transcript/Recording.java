/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.collect.ImmutableList;
import com.google.auto.value.AutoValue;
import java.io.File;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.time.temporal.TemporalAccessor;

@AutoValue
public abstract class Recording {
	public enum Kind {
		PRESIDENTIAL_DEBATE
	}

	public Kind kind() {
		return Kind.PRESIDENTIAL_DEBATE;
	}

	public abstract String yyyyMMdd();

	public abstract String youtubeId();

	public abstract int durationSec();

	public static ImmutableList<Recording> national() {
		Builder builder = new Builder();
		// Kennedy, Nixon
		builder.add("1960-09-26", "hb1AvG18H30", "0:57:55"); // 1 of 4
		//		// videos.addNoTranscript("z-4VeDta7Mo", "John F. Kennedy - Nixon (2/4)", "1960-10-07", "0:58:48");
		//		videos.addNoTranscript("8SdDhojNT2o", "John F. Kennedy - Nixon (3/4)", "1960-10-13", "0:58:36");
		//		videos.addNoTranscript("LN8F1FGZfzA", "John F. Kennedy - Nixon (4/4)", "1960-10-21", "0:58:51");
		// Carter, Ford
		//		videos.addNoTranscript("GlPjW_2_LXI", "Jimmy Carter - Gerald Ford (1/3)", "1976-09-23", "1:55:22");
		builder.add("1976-10-06", "SLy5fq1b4jA", "1:27:04"); // 2 of 3
		//		videos.addNoTranscript("CipT04S0bVE", "Jimmy Carter - Gerald Ford (3/3)", "1976-10-22", "1:29:37");
		//		videos.addNoTranscript("_8YxFc_1b_0", "Ronald Reagan - Jimmy Carter (1/1)", "1980-10-28", "1:34:51");
		//		videos.addNoTranscript("OGvBFQQPRXs", "Ronald Reagan - Walter Mondale (1/2)", "1984-10-07", "1:40:27");
		//		videos.addNoTranscript("EF73k5-Hiqg", "Ronald Reagan - Walter Mondale (2/2)", "1984-10-21", "1:27:33");
		//		videos.addNoTranscript("PbSzCpUyLPc", "George H.W. Bush - Michael Dukakis (1/2)", "1988-09-25", "1:31:48");
		//		videos.addNoTranscript("OGpROh7Ia10", "George H.W. Bush - Michael Dukakis (2/2)", "1988-10-13", "1:34:29");
		//		videos.addNoTranscript("XD_cXN9O9ds", "Bill Clinton - George H.W. Bush (1/3)", "1992-10-11", "1:37:01");
		//		videos.addNoTranscript("m6sUGKAm2YQ", "Bill Clinton - George H.W. Bush (2/3)", "1992-10-15", "1:52:35");
		//		videos.addNoTranscript("jCGtHqIwKek", "Bill Clinton - George H.W. Bush (3/3)", "1992-10-19", "1:37:08");
		//		videos.addNoTranscript("lZhyS5OtPto", "Bill Clinton - Bob Dole (1/2)", "1996-10-06", "1:37:29");
		//		videos.addNoTranscript("I1fcJjdvLn4", "Bill Clinton - Bob Dole (2/2)", "1996-10-16", "1:39:45");
		//		videos.addNoTranscript("ibcDfgiin2c", "George W. Bush - Al Gore (1/3)", "2000-10-03", "2:01:12");
		//		videos.addNoTranscript("zBXoItXHLTM", "George W. Bush - Al Gore (2/3)", "2000-10-11", "2:01:32");
		//		videos.addNoTranscript("qCIHimWyFb4", "George W. Bush - Al Gore (3/3)", "2000-10-17", "2:01:44");
		//		videos.addNoTranscript("3aNfcxjZkRg", "George W. Bush - John Kerry (1/3)", "2004-09-30", "1:29:10");
		//		videos.addNoTranscript("21fXfTmv-aQ", "George W. Bush - John Kerry (2/3)", "2004-10-08", "2:00:19");
		//		videos.addNoTranscript("QcNLfajsA_M", "George W. Bush - John Kerry (3/3)", "2004-10-13", "1:32:42");
		//		videos.addNoTranscript("F-nNIEduEOw", "Barack Obama - John McCain (1/3)", "2008-09-26", "1:36:43");
		//		videos.addNoTranscript("VkBqLBsu-o4", "Barack Obama - John McCain (2/3)", "2008-10-07", "1:39:25");
		//		videos.addNoTranscript("DvdfO0lq4rQ", "Barack Obama - John McCain (3/3)", "2008-10-13", "1:30:35");
		//		videos.addNoTranscript("dkrwUU_YApE", "Barack Obama - Mitt Romney (1/3)", "2012-10-03", "1:29:41");
		//		videos.addNoTranscript("QEpCrcMF5Ps", "Barack Obama - Mitt Romney (2/3)", "2012-10-16", "1:37:40");
		//		videos.addNoTranscript("tecohezcA78", "Barack Obama - Mitt Romney (3/3)", "2012-10-22", "1:36:16");
		// Clinton, Trump
		//		videos.addNoTranscript("NscjkqaJ8wI", "Donald Trump - Hillary Clinton (1/3)", "2016-09-26", "1:35:46");
		builder.add("2016-10-09", "OtlHBa7YMJ4", "1:33:44");
		//		videos.addNoTranscript("fT0spjjJOK8", "Donald Trump - Hillary Clinton (3/3)", "2016-10-16", "1:33:47");
		return builder.recordings.build();
	}

	private static class Builder {
		ImmutableList.Builder<Recording> recordings = ImmutableList.builder();

		Builder add(String date, String youtubeId, String duration) {
			recordings.add(new AutoValue_Recording(date, youtubeId, parseDuration(duration)));
			return this;
		}

		private static final DateTimeFormatter hhmmss = DateTimeFormatter.ofPattern("H:mm:ss");

		private static int parseDuration(String input) {
			TemporalAccessor accessor = hhmmss.parse(input);
			int hr = accessor.get(ChronoField.CLOCK_HOUR_OF_DAY);
			int min = accessor.get(ChronoField.MINUTE_OF_HOUR);
			int sec = accessor.get(ChronoField.SECOND_OF_MINUTE);
			return sec + (60 * min) + (60 * 60 * hr);
		}
	}

	public File getSaidFile() {
		return new File("src/main/resources/transcript/speakers/" + yyyyMMdd() + ".said");
	}

	public File getVttFile() {
		return new File("src/main/resources/transcript/vtt/" + yyyyMMdd() + ".vtt");
	}
}
