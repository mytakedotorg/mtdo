/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import java.io.IOException;
import org.junit.Ignore;
import org.junit.Test;

public class OurV8Test {
	@Ignore
	@Test
	public void test() throws IOException {
		try (OurV8 ourV8 = new OurV8()) {
			ourV8.attachConsole();
			ourV8.executeUrl("https://unpkg.com/react@15.6.2/dist/react.min.js");
			ourV8.executeResource("/assets/scripts/drawVideoFact.bundle.js");
			ourV8.v8().executeScript("drawVideoFact.default()");
		}
	}
}
