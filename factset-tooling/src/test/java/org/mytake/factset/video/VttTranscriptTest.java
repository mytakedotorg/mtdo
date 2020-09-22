/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.factset.video;


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
import org.mytake.factset.video.VttTranscript.LineHeader;
import org.mytake.factset.video.VttTranscript.Mode;

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
