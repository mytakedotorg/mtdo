/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import common.PageAssert;
import common.Snapshot;
import org.junit.Test;

public class AboutTest {
	@Test
	public void template() {
		PageAssert.assertThatStaticUrl(new About(), "/about").bodyAssertRaw(body -> {
			Snapshot.match("about", body);
		});
	}
}
