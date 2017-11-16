/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import common.JoobyDevRule;
import common.Snapshot;
import org.junit.ClassRule;
import org.junit.Test;

public class DraftsTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void drafts() {
		Snapshot.match("samplesDrafts", dev.givenUser("samples").get("/drafts").asString());
		Snapshot.match("otherDrafts", dev.givenUser("other").get("/drafts").asString());
	}
}
