/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.diffplug.common.base.Errors;
import com.jsoniter.JsonIterator;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java2ts.Foundation.CaptionWord;
import java2ts.Foundation.Fact;
import java2ts.Foundation.FactContent;
import java2ts.Foundation.Person;
import java2ts.Foundation.SpeakerMap;
import java2ts.Foundation.VideoFactContent;
import java2ts.Foundation.VideoFactContentEncoded;
import org.mytake.foundation.parsers.VttParser;

public class Videos extends FactWriter<VideoFactContent> {
	public static Videos national() throws NoSuchAlgorithmException, IOException {
		Videos videos = new Videos(Folders.SRC_VIDEO, Folders.DST_FOUNDATION);
		videos.add("Txkwp5AUfCg", "John F. Kennedy - Nixon (1/4)", "1960-09-26");
		videos.add("z-4VeDta7Mo", "John F. Kennedy - Nixon (2/4)", "1960-10-07");
		videos.add("8SdDhojNT2o", "John F. Kennedy - Nixon (3/4)", "1960-10-13");
		videos.add("LN8F1FGZfzA", "John F. Kennedy - Nixon (4/4)", "1960-10-21");
		videos.add("GlPjW_2_LXI", "Jimmy Carter - Gerald Ford (1/3)", "1976-09-23");

		//id: "TjHjU0Eu26Y",  // Original video
		//id: "vIZ6w0kMqUA", // Trimmed for dev work, with captions
		videos.addWithTranscript("GX1kHw2tmtI", "Jimmy Carter - Gerald Ford (2/3)", "1976-10-06");

		videos.add("CipT04S0bVE", "Jimmy Carter - Gerald Ford (3/3)", "1976-10-22");
		videos.add("_8YxFc_1b_0", "Ronald Reagan - Jimmy Carter (1/1)", "1980-10-28");
		videos.add("OGvBFQQPRXs", "Ronald Reagan - Walter Mondale (1/2)", "1984-10-07");
		videos.add("EF73k5-Hiqg", "Ronald Reagan - Walter Mondale (2/2)", "1984-10-21");
		videos.add("PbSzCpUyLPc", "George H.W. Bush - Michael Dukakis (1/2)", "1988-09-25");
		videos.add("OGpROh7Ia10", "George H.W. Bush - Michael Dukakis (2/2)", "1988-10-13");
		videos.add("XD_cXN9O9ds", "Bill Clinton - George H.W. Bush (1/3)", "1992-10-11");
		videos.add("m6sUGKAm2YQ", "Bill Clinton - George H.W. Bush (2/3)", "1992-10-15");
		videos.add("jCGtHqIwKek", "Bill Clinton - George H.W. Bush (3/3)", "1992-10-19");
		videos.add("lZhyS5OtPto", "Bill Clinton - Bob Dole (1/2)", "1996-10-06");
		videos.add("I1fcJjdvLn4", "Bill Clinton - Bob Dole (2/2)", "1996-10-16");
		videos.add("ibcDfgiin2c", "George W. Bush - Al Gore (1/3)", "2000-10-03");
		videos.add("zBXoItXHLTM", "George W. Bush - Al Gore (2/3)", "2000-10-11");
		videos.add("qCIHimWyFb4", "George W. Bush - Al Gore (3/3)", "2000-10-17");
		videos.add("1kW8_Qqff38", "George W. Bush - John Kerry (1/3)", "2004-09-30");
		videos.add("21fXfTmv-aQ", "George W. Bush - John Kerry (2/3)", "2004-10-08");
		videos.add("QcNLfajsA_M", "George W. Bush - John Kerry (3/3)", "2004-10-13");
		videos.add("F-nNIEduEOw", "Barack Obama - John McCain (1/3)", "2008-09-26");
		videos.add("VkBqLBsu-o4", "Barack Obama - John McCain (2/3)", "2008-10-07");
		videos.add("DvdfO0lq4rQ", "Barack Obama - John McCain (3/3)", "2008-10-13");
		videos.add("dkrwUU_YApE", "Barack Obama - Mitt Romney (1/3)", "2012-10-03");
		videos.add("QEpCrcMF5Ps", "Barack Obama - Mitt Romney (2/3)", "2012-10-16");
		videos.add("tecohezcA78", "Barack Obama - Mitt Romney (3/3)", "2012-10-22");
		videos.add("NscjkqaJ8wI", "Donald Trump - Hillary Clinton (1/3)", "2016-09-26");
		//id: "qkk1lrLQl9Q",  // Original video
		//id: "QuPWV36zqdc",  // Trimmed for dev work, with captions
		videos.addWithTranscript("ApTLB76Nmdg", "Donald Trump - Hillary Clinton (2/3)", "2016-10-09");
		videos.add("fT0spjjJOK8", "Donald Trump - Hillary Clinton (3/3)", "2016-10-16");

		return videos;
	}

	private Videos(Path srcDir, Path dstDir) {
		super(srcDir, dstDir);
	}

	Map<String, VideoFactContent> byTitle = new HashMap<>();

	private void add(String youtubeId, String title, String date, boolean withTranscript) throws NoSuchAlgorithmException, IOException {
		VideoFactContent content = new VideoFactContent();
		content.youtubeId = youtubeId;
		if (withTranscript) {
			content.transcript = VttParser.parse(read(slugify(title) + ".vtt"));
			Speakers speakers = JsonIterator.deserialize(read(slugify(title) + ".speakermap.json"), Speakers.class);
			content.speakers = speakers.speakers;
			content.speakerMap = speakers.speakerMap;
		}
		byTitle.put(title, content);
		add(title, date, "recorded", "video");
	}

	@Override
	protected void postProcess(VideoFactContent slow, String hashStr) {
		if (slow.speakers == null) {
			return;
		}
		VideoFactContentJava fast = createFast(slow);
		write(hashStr + "-fast", fast);
		VideoFactContentEncoded encoded = createEncoded(fast);
		write(hashStr + "-encoded", encoded);
	}

	private void write(String name, Object value) {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		JsonMisc.toJson(value, output);
		byte[] contentBytes = output.toByteArray();
		Errors.rethrow().run(() -> {
			Files.write(dstDir.resolve(name + ".json"), contentBytes);
		});
	}

	/** Convert to the arrays. */
	private VideoFactContentJava createFast(VideoFactContent slow) {
		VideoFactContentJava fast = new VideoFactContentJava();
		fast.fact = slow.fact;
		fast.youtubeId = slow.youtubeId;
		fast.charOffsets = new int[slow.transcript.size()];
		fast.timestamps = new float[slow.transcript.size()];
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

	/** Encode the arrays into a byte array. */
	private VideoFactContentEncoded createEncoded(VideoFactContentJava fast) {
		VideoFactContentEncoded encoded = new VideoFactContentEncoded();
		encoded.fact = fast.fact;
		encoded.youtubeId = fast.youtubeId;
		encoded.speakers = fast.speakers;
		encoded.plainText = fast.plainText;
		encoded.numWords = fast.charOffsets.length;
		encoded.numSpeakerSections = fast.speakerPerson.length;
		encoded.data = fast.arraysToBase64();
		return encoded;
	}

	private void addWithTranscript(String youtubeId, String title, String date) throws NoSuchAlgorithmException, IOException {
		add(youtubeId, title, date, true);
	}

	private void add(String youtubeId, String title, String date) throws NoSuchAlgorithmException, IOException {
		add(youtubeId, title, date, false);
	}

	static class VideoFactContentJava extends FactContent {
		public String youtubeId;
		public List<Person> speakers;
		public String plainText;
		public int[] charOffsets;
		public float[] timestamps;
		public int[] speakerPerson;
		public int[] speakerWord;

		public String arraysToBase64() {
			int numWords = charOffsets.length;
			int numSpeakerSections = speakerPerson.length;

			int size = 8 * numWords + 8 * numSpeakerSections;
			ByteBuffer buffer = ByteBuffer.allocate(size);
			buffer.order(ByteOrder.LITTLE_ENDIAN);
			putAll(buffer, charOffsets);
			putAll(buffer, timestamps);
			putAll(buffer, speakerPerson);
			putAll(buffer, speakerWord);

			byte[] bytes = new byte[buffer.capacity()];
			buffer.flip();
			buffer.get(bytes);
			return Base64.getEncoder().encodeToString(bytes);
		}

		static void putAll(ByteBuffer buffer, int[] array) {
			for (int value : array) {
				buffer.putInt(value);
			}
		}

		static void putAll(ByteBuffer buffer, float[] array) {
			for (float value : array) {
				buffer.putFloat(value);
			}
		}
	}

	static class Speakers {
		public List<Person> speakers;
		public List<SpeakerMap> speakerMap;
	}

	@Override
	protected VideoFactContent factToContent(Fact fact) {
		return byTitle.get(fact.title);
	}
}
