/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import com.jsoniter.JsonIterator;
import compat.java2ts.VideoFactContentJava;
import java.io.IOException;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.time.temporal.TemporalAccessor;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java2ts.Foundation;
import java2ts.Foundation.CaptionWord;
import java2ts.Foundation.Fact;
import java2ts.Foundation.Person;
import java2ts.Foundation.SpeakerMap;
import java2ts.Foundation.VideoFactContentEncoded;
import java2ts.Foundation.VideoFactContentLegacy;
import org.mytake.foundation.parsers.VttParser;

public class Videos extends FactWriter<VideoFactContentEncoded> {
	public static Videos national() throws NoSuchAlgorithmException, IOException {
		Videos videos = new Videos(Folders.SRC_VIDEO, Folders.DST_FOUNDATION);
		videos.addNoTranscript("Txkwp5AUfCg", "John F. Kennedy - Nixon (1/4)", "1960-09-26", "0:57:55");
		videos.addNoTranscript("z-4VeDta7Mo", "John F. Kennedy - Nixon (2/4)", "1960-10-07", "0:58:48");
		videos.addNoTranscript("8SdDhojNT2o", "John F. Kennedy - Nixon (3/4)", "1960-10-13", "0:58:36");
		videos.addNoTranscript("LN8F1FGZfzA", "John F. Kennedy - Nixon (4/4)", "1960-10-21", "0:58:51");
		videos.addNoTranscript("GlPjW_2_LXI", "Jimmy Carter - Gerald Ford (1/3)", "1976-09-23", "1:55:22");

		//id: "TjHjU0Eu26Y",  // Original video
		//id: "vIZ6w0kMqUA", // Trimmed for dev work, with captions
		videos.addWithTranscript("GX1kHw2tmtI", "Jimmy Carter - Gerald Ford (2/3)", "1976-10-06", "1:27:04");

		videos.addNoTranscript("CipT04S0bVE", "Jimmy Carter - Gerald Ford (3/3)", "1976-10-22", "1:29:37");
		videos.addNoTranscript("_8YxFc_1b_0", "Ronald Reagan - Jimmy Carter (1/1)", "1980-10-28", "1:34:51");
		videos.addNoTranscript("OGvBFQQPRXs", "Ronald Reagan - Walter Mondale (1/2)", "1984-10-07", "1:40:27");
		videos.addNoTranscript("EF73k5-Hiqg", "Ronald Reagan - Walter Mondale (2/2)", "1984-10-21", "1:27:33");
		videos.addNoTranscript("PbSzCpUyLPc", "George H.W. Bush - Michael Dukakis (1/2)", "1988-09-25", "1:31:48");
		videos.addNoTranscript("OGpROh7Ia10", "George H.W. Bush - Michael Dukakis (2/2)", "1988-10-13", "1:34:29");
		videos.addNoTranscript("XD_cXN9O9ds", "Bill Clinton - George H.W. Bush (1/3)", "1992-10-11", "1:37:01");
		videos.addNoTranscript("m6sUGKAm2YQ", "Bill Clinton - George H.W. Bush (2/3)", "1992-10-15", "1:52:35");
		videos.addNoTranscript("jCGtHqIwKek", "Bill Clinton - George H.W. Bush (3/3)", "1992-10-19", "1:37:08");
		videos.addNoTranscript("lZhyS5OtPto", "Bill Clinton - Bob Dole (1/2)", "1996-10-06", "1:37:29");
		videos.addNoTranscript("I1fcJjdvLn4", "Bill Clinton - Bob Dole (2/2)", "1996-10-16", "1:39:45");
		videos.addNoTranscript("ibcDfgiin2c", "George W. Bush - Al Gore (1/3)", "2000-10-03", "2:01:12");
		videos.addNoTranscript("zBXoItXHLTM", "George W. Bush - Al Gore (2/3)", "2000-10-11", "2:01:32");
		videos.addNoTranscript("qCIHimWyFb4", "George W. Bush - Al Gore (3/3)", "2000-10-17", "2:01:44");
		videos.addNoTranscript("3aNfcxjZkRg", "George W. Bush - John Kerry (1/3)", "2004-09-30", "1:29:10");
		videos.addNoTranscript("21fXfTmv-aQ", "George W. Bush - John Kerry (2/3)", "2004-10-08", "2:00:19");
		videos.addNoTranscript("QcNLfajsA_M", "George W. Bush - John Kerry (3/3)", "2004-10-13", "1:32:42");
		videos.addNoTranscript("F-nNIEduEOw", "Barack Obama - John McCain (1/3)", "2008-09-26", "1:36:43");
		videos.addNoTranscript("VkBqLBsu-o4", "Barack Obama - John McCain (2/3)", "2008-10-07", "1:39:25");
		videos.addNoTranscript("DvdfO0lq4rQ", "Barack Obama - John McCain (3/3)", "2008-10-13", "1:30:35");
		videos.addNoTranscript("dkrwUU_YApE", "Barack Obama - Mitt Romney (1/3)", "2012-10-03", "1:29:41");
		videos.addNoTranscript("QEpCrcMF5Ps", "Barack Obama - Mitt Romney (2/3)", "2012-10-16", "1:37:40");
		videos.addNoTranscript("tecohezcA78", "Barack Obama - Mitt Romney (3/3)", "2012-10-22", "1:36:16");
		videos.addNoTranscript("NscjkqaJ8wI", "Donald Trump - Hillary Clinton (1/3)", "2016-09-26", "1:35:46");
		//id: "qkk1lrLQl9Q",  // Original video
		//id: "QuPWV36zqdc",  // Trimmed for dev work, with captions
		videos.addWithTranscript("ApTLB76Nmdg", "Donald Trump - Hillary Clinton (2/3)", "2016-10-09", "1:33:44");
		videos.addNoTranscript("fT0spjjJOK8", "Donald Trump - Hillary Clinton (3/3)", "2016-10-16", "1:33:47");

		return videos;
	}

	private Videos(Path srcDir, Path dstDir) {
		super(srcDir, dstDir);
	}

	Map<String, VideoFactContentEncoded> byTitle = new HashMap<>();

	private void add(String youtubeId, String title, String date, String duration, boolean withTranscript) throws NoSuchAlgorithmException, IOException {
		VideoFactContentLegacy legacy = new VideoFactContentLegacy();
		legacy.youtubeId = youtubeId;
		legacy.durationSeconds = parseDuration(duration);

		if (withTranscript) {
			legacy.transcript = VttParser.parse(read(slugify(title) + ".vtt"));
			Speakers speakers = JsonIterator.deserialize(read(slugify(title) + ".speakermap.json"), Speakers.class);
			legacy.speakers = speakers.speakers;
			legacy.speakerMap = speakers.speakerMap;
		} else {
			legacy.transcript = Collections.emptyList();
			legacy.speakers = Collections.emptyList();
			legacy.speakerMap = Collections.emptyList();
		}

		VideoFactContentJava fast = createFast(legacy);
		byTitle.put(title, fast.toEncoded());
		add(title, date, "recorded", Foundation.KIND_VIDEO);
	}

	private static final DateTimeFormatter hhmmss = DateTimeFormatter.ofPattern("H:mm:ss");

	private static double parseDuration(String input) {
		TemporalAccessor accessor = hhmmss.parse(input);
		int hr = accessor.get(ChronoField.CLOCK_HOUR_OF_DAY);
		int min = accessor.get(ChronoField.MINUTE_OF_HOUR);
		int sec = accessor.get(ChronoField.SECOND_OF_MINUTE);
		return sec + (60 * min) + (60 * 60 * hr);
	}

	/** Convert to the arrays. */
	private VideoFactContentJava createFast(VideoFactContentLegacy slow) {
		VideoFactContentJava fast = new VideoFactContentJava();
		fast.fact = slow.fact;
		fast.youtubeId = slow.youtubeId;
		fast.durationSecs = slow.durationSeconds.doubleValue();
		fast.charOffsets = new int[slow.transcript.size()];
		fast.timestamps = new double[slow.transcript.size()];
		fast.speakerPerson = new int[slow.speakerMap.size()];
		fast.speakerWord = new int[slow.speakerMap.size()];

		StringBuilder plainText = new StringBuilder();
		for (int i = 0; i < slow.transcript.size(); ++i) {
			CaptionWord word = slow.transcript.get(i);
			fast.charOffsets[i] = plainText.length();
			fast.timestamps[i] = (float) word.timestamp;
			plainText.append(word.word);
		}
		fast.speakers = slow.speakers;
		fast.plainText = plainText.toString();
		Map<String, Integer> lastnameToIdx = new HashMap<>();
		for (int i = 0; i < slow.speakers.size(); ++i) {
			lastnameToIdx.put(slow.speakers.get(i).lastname, i);
		}
		for (int i = 0; i < slow.speakerMap.size(); ++i) {
			SpeakerMap speakerMap = slow.speakerMap.get(i);
			fast.speakerWord[i] = speakerMap.range.$0;
			fast.speakerPerson[i] = lastnameToIdx.get(speakerMap.speaker);
		}
		return fast;
	}

	private void addWithTranscript(String youtubeId, String title, String date, String duration) throws NoSuchAlgorithmException, IOException {
		add(youtubeId, title, date, duration, true);
	}

	private void addNoTranscript(String youtubeId, String title, String date, String duration) throws NoSuchAlgorithmException, IOException {
		add(youtubeId, title, date, duration, false);
	}

	static class Speakers {
		public List<Person> speakers;
		public List<SpeakerMap> speakerMap;
	}

	@Override
	protected VideoFactContentEncoded factToContent(Fact fact) {
		return byTitle.get(fact.title);
	}
}
