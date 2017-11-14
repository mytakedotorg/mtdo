/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import common.PageAssert;
import common.Snapshot;
import org.junit.Test;

public class AboutUsTest {
	@Test
	public void template() {
		PageAssert.assertThatStaticUrl(new AboutUs(), "/aboutus").bodyAssertRaw(body -> {
			Snapshot.match("aboutus", body);
		});
	}
}
