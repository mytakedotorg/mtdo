/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Resources;
import java.nio.charset.StandardCharsets;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.mytake.foundation.transcript.VttTranscript.LineHeader;

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
	public void transcriptRoundtrip() {
		Consumer<String> roundtrip = Errors.rethrow().wrap(name -> {
			String content = Resources.toString(VttTranscriptTest.class.getResource("/transcript/vtt/" + name + ".vtt"), StandardCharsets.UTF_8);
			VttTranscript transcript = VttTranscript.parse(content);
			String rountripped = transcript.asString();
			Assertions.assertThat(rountripped).isEqualTo(content);
		});
		roundtrip.accept("1960-09-26");
		roundtrip.accept("1976-10-06 - Presidential Debate - Jimmy E Carter vs Gerald R Ford (2 of 3)");
		roundtrip.accept("2016-10-09 - Presidential Debate - Hillary R Clinton vs Donald J Trump (2 of 3)");
	}
}
