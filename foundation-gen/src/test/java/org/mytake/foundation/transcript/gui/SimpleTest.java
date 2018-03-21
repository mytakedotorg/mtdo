/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript.gui;

import com.diffplug.common.swt.InteractiveTest;
import org.junit.Test;
import org.mytake.foundation.transcript.Recording;

public class SimpleTest {
	@Test
	public void test() {
		InteractiveTest.testCoat("Blah", cmp -> {
			Recording recording = Recording.national().get(0);
			new TranscriptCoat(cmp, recording);
		});
	}
}
