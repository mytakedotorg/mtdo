/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.fact.transcript;

import com.diffplug.common.io.CharSink;
import com.diffplug.common.io.CharStreams;
import com.diffplug.common.io.Files;
import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.mytake.fact.transcript.VttTranscript.LineHeader;
import org.mytake.fact.transcript.VttTranscript.Mode;

public class VttTranscriptTest {
	@Test
	public void timestampRoundtrip() {
		BiConsumer<String, Double> roundtrip = (str, dbl) -> {
			Assertions.assertThat(VttTranscript.str2ts(str)).isEqualTo(dbl.doubleValue());
			Assertions.assertThat(VttTranscript.ts2str(dbl)).isEqualTo(str);
		};
		roundtrip.accept("00:00:00.000", 0.0);
		roundtrip.accept("00:00:00.100", 0.1);
		roundtrip.accept("00:00:00.900", 0.9);
		roundtrip.accept("00:00:59.100", 59.1);
		roundtrip.accept("00:00:59.900", 59.9);
		roundtrip.accept("00:01:00.000", 60.0);
		roundtrip.accept("01:00:00.000", 60.0 * 60.0);
	}

	@Test
	public void lineHeaderRoundtrip() {
		Consumer<String> roundtrip = str -> {
			LineHeader header = LineHeader.parse(str);
			Assertions.assertThat(str).isEqualTo(header.asString());
		};
		roundtrip.accept("00:00:00.030 --> 00:00:03.929 align:start position:19%");
		roundtrip.accept("00:03:58.080 --> 00:04:03.030 align:start position:19%");
		LineHeader header = LineHeader.parse("00:03:58.080 --> 00:04:03.030 align:start position:19%");
		Assertions.assertThat(header.start()).isEqualTo(3 * 60 + 58.080);
		Assertions.assertThat(header.end()).isEqualTo(4 * 60 + 03.030);
		Assertions.assertThat(header.formatting()).isEqualTo("align:start position:19%");
	}

	@Test
	public void testSaveWithRemove() throws IOException {
		File folder = new File("src/test/resources/org/mytake/foundation/transcript");
		File after = new File(folder, "afterRemove.vtt");
		File before = new File(folder, "beforeRemove.vtt");

		// parse the transcript
		VttTranscript vtt = VttTranscript.parse(before, Mode.STRICT);
		// find the trouble word
		List<Word.Vtt> words = vtt.words();
		Word.Vtt and = words.stream().filter(w -> w.time == 3305.010).findFirst().get();
		// remove it
		words.remove(and);
		// save it
		InMemoryCharSink sink = new InMemoryCharSink();
		vtt.save(words, sink);
		// make sure it equals what we want it to equal
		Assertions.assertThat(sink.sb.toString()).isEqualTo(Files.asCharSource(after, StandardCharsets.UTF_8).read());
	}

	static class InMemoryCharSink extends CharSink {
		private final StringBuilder sb = new StringBuilder();

		@Override
		public Writer openStream() throws IOException {
			return CharStreams.asWriter(sb);
		}
	}
}
