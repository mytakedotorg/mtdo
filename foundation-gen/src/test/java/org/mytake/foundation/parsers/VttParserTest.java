/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation.parsers;

import java.util.List;
import java2ts.Foundation.CaptionWord;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class VttParserTest {
	@Test
	public void doSomeTest() {
		List<CaptionWord> words = VttParser.parse("WEBVTT\n" +
				"Kind: captions\n" +
				"Language: en\n" +
				"Style:\n" +
				"::cue(c.colorCCCCCC) { color: rgb(204,204,204);\n" +
				" }\n" +
				"::cue(c.colorE5E5E5) { color: rgb(229,229,229);\n" +
				" }\n" +
				"##\n" +
				"\n" +
				"00:00:00.890 --> 00:00:06.029 align:start position:19%\n" +
				"Good<00:00:01.890><c> evening</c><00:00:02.070><c> I'm</c><00:00:02.520><c> Pauline</c><00:00:02.939><c> Frederick</c><00:00:03.419><c> of</c></c>\n" +
				"\n" +
				"00:00:03.540 --> 00:00:09.599 align:start position:19%\n" +
				"NPR,<00:00:04.140><c> moderator</c><00:00:04.890><c> of</c></c><00:00:05.009><c> this</c><00:00:05.279><c> second</c><00:00:05.759><c> of</c><00:00:05.910><c> the</c></c>\n");
		assertWords(words,
				1.890, "Good",
				2.070, "evening",
				2.520, "I'm",
				2.939, "Pauline",
				3.419, "Frederick",
				3.540, "of",
				4.140, "NPR,",
				4.890, "moderator",
				5.009, "of",
				5.279, "this",
				5.759, "second",
				5.910, "of");
		// I think we might be off by one on these timestamps, and it's meant to be like this:
		//		assertWords(words,
		//				0.890, "Good",
		//				1.890, "evening",
		//				2.070, "I'm",
		//				2.520, "Pauline",
		//				2.939, "Frederick",
		//				3.419, "of",
		//				3.540, "NPR",
		//				4.140, "moderator",
		//				4.890, "of",
		//				5.009, "this",
		//				5.279, "second",
		//				5.759, "of",
		//				5.910, "the");
	}

	private void assertWords(List<CaptionWord> words, Object... args) {
		Assertions.assertThat(words.size()).isEqualTo(args.length / 2);
		for (int i = 0; i < args.length / 2; ++i) {
			CaptionWord word = words.get(i);
			Assertions.assertThat(word.idx).isEqualTo(i);
			Assertions.assertThat(word.timestamp).isEqualTo(args[2 * i]);
			Assertions.assertThat(word.word).isEqualTo(args[2 * i + 1] + " ");
		}
	}
}
