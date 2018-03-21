/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import java.io.IOException;
import org.junit.Test;

public class SaidTranscriptTest {
	/** Loads every transcript, to make sure that all of its speakers are known. */
	@Test
	public void transcriptRead() throws IOException {
		for (Recording recording : Recording.national()) {
			SaidTranscript.parseName(recording.yyyyMMdd());
		}
	}
}
