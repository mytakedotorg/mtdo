/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import common.JoobyDevRule;
import common.JsonPost;
import java2ts.Routes;
import java2ts.Share;
import org.assertj.core.api.Assertions;
import org.junit.ClassRule;
import org.junit.Test;

public class SharesTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void shareableURL() {
		Share.ShareReq req = new Share.ShareReq();
		req.title = "User generated title";
		req.hStart = "12.44";
		req.hEnd = "23.15";
		req.vStart = "11.369";
		req.vEnd = "24.221";
		Share.ShareRes res = JsonPost.post(dev.givenUser("samples"), req, Routes.API_SHARE, Share.ShareRes.class);
		Assertions.assertThat(res).isNotNull();
	}
}
