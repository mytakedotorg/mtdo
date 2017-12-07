/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import common.JoobyDevRule;
import io.restassured.RestAssured;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.jooby.Jooby;
import org.jooby.Request;
import org.jooby.Status;
import org.junit.Assert;
import org.junit.ClassRule;
import org.junit.Test;

public class DiscourseAuthTest {
	private static final String SECRET = "d836444a9e4084d5b224a60c208dce14";

	static class App extends Jooby {
		{
			use(new DiscourseAuth() {
				@Override
				public Config config() {
					Map<String, String> map = new HashMap<>();
					map.put("discourse.secret", SECRET);
					return ConfigFactory.parseMap(map);
				}

				@Override
				protected String appendUserInfoToNonce(Request req, String nonce) throws UnsupportedEncodingException {
					return nonce
							+ "&name=" + urlEncode("sam")
							+ "&username=" + urlEncode("samsam")
							+ "&email=" + urlEncode("test@test.com")
							+ "&external_id=" + urlEncode("hello123")
							+ "&require_activation=" + urlEncode("true");
				}
			});
		}
	}

	@ClassRule
	public static JoobyDevRule app = new JoobyDevRule(new App());

	@Test
	public void test() throws MalformedURLException {
		URL url = new URL("http://localhost:8080/api/discourseAuth?sso=bm9uY2U9Y2I2ODI1MWVlZmI1MjExZTU4YzAwZmYxMzk1ZjBjMGI%3D%0A&sig=2828aa29899722b35a2f191d34ef9b3ce695e0e6eeec47deb46d588d70c7cb56");
		String location = RestAssured.given().redirects().follow(false).get(url)
				.then()
				.statusCode(Status.FOUND.value())
				.extract().header("Location");
		// The Discourse docs say signature = "1c884222282f3feacd76802a9dd94e8bc8deba5d619b292bed75d63eb3152c0b" and then say "whoops nevermind, not that".
		// We're calculating "3a8dd1a73254003d616d610f66049cf741dfcb924c76b9e75efa01b2507ad0d0", I'll see if they're getting the same or not
		//                   https://meta.mytake.org/session/sso_login?sso=bm9uY2U9Y2I2ODI1MWVlZmI1MjExZTU4YzAwZmYxMzk1ZjBjMGImbmFtZT1zYW0mdXNlcm5hbWU9%0Ac2Ftc2FtJmVtYWlsPXRlc3QlNDB0ZXN0LmNvbSZleHRlcm5hbF9pZD1oZWxsbzEyMyZyZXF1aXJl%0AX2FjdGl2YXRpb249dHJ1ZQ%3D%3D%0A&sig=1c884222282f3feacd76802a9dd94e8bc8deba5d619b292bed75d63eb3152c0b
		Assert.assertEquals("https://meta.mytake.org/session/sso_login?sso=bm9uY2U9Y2I2ODI1MWVlZmI1MjExZTU4YzAwZmYxMzk1ZjBjMGImbmFtZT1zYW0mdXNlcm5hbWU9%0Ac2Ftc2FtJmVtYWlsPXRlc3QlNDB0ZXN0LmNvbSZleHRlcm5hbF9pZD1oZWxsbzEyMyZyZXF1aXJl%0AX2FjdGl2YXRpb249dHJ1ZQ%3D%3D%0A&sig=3a8dd1a73254003d616d610f66049cf741dfcb924c76b9e75efa01b2507ad0d0", location);
	}
}
