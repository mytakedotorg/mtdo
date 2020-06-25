/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
 * You can contact us at team@mytake.org
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
		req.vidId = "EuBv33KFOcVItXjivwaqki89kC6YT63StCHz5wZAa7M=";
		req.hStart = "12.44";
		req.hEnd = "23.15";
		req.vStart = "11.369";
		req.vEnd = "24.221";
		Share.ShareRes res = JsonPost.post(dev.givenUser("samples"), req, Routes.API_SHARE, Share.ShareRes.class);
		Assertions.assertThat(res).isNotNull();
	}
}
