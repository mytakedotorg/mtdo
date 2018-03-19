/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.io.Resources;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.junit.Test;

public class SpeakersTranscriptTest {
	SpeakersTranscript transcript(String name) throws IOException {
		String content = Resources.toString(SpeakersTranscriptTest.class.getResource("/transcript/speakers/" + name + ".speakers"), StandardCharsets.UTF_8);
		return SpeakersTranscript.parse(content);
	}

	/** Loads every transcript, to make sure that all of its speakers are known. */
	@Test
	public void transcriptRead() throws IOException {
		for (Recording recording : Recording.national()) {
			transcript(recording.yyyyMMdd());
		}
	}
}
