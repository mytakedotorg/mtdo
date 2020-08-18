/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package common;

import com.diffplug.common.base.Unhandled;
import forms.api.RockerRaw;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.concurrent.TimeUnit;
import java2ts.Routes;
import okhttp3.ConnectionPool;
import okhttp3.HttpUrl;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import org.jooby.Env;
import org.jooby.Jooby;
import views.SocialEmbed.socialImage;

public class SocialEmbed {
	private static final String DEV_URL = "/devSocialEmbed";

	private static final int MAX_WAIT_MS = 500;
	private static final int NODE_DEV_PORT = 4000;
	private static final boolean isHerokuProd = "true".equals(System.getenv("HEROKU_NAKED_PROD"));

	public static SocialEmbed get(org.jooby.Request req, String embedRison) throws IOException {
		return req.require(GetHeader.class).get(Routes.PATH_NODE_SOCIAL_HEADER + embedRison);
	}

	public static SocialEmbed todo() {
		return null;
	}

	public static SocialEmbed todo(String input) {
		return null;
	}

	private String metaTags;

	private SocialEmbed(String metaTags) {
		this.metaTags = metaTags;
	}

	public RockerRaw header() {
		return RockerRaw.raw(metaTags);
	}

	static class GetHeader {
		private final String httpDomain;
		private final HttpUrl httpDomainOk;
		private final OkHttpClient client;

		private GetHeader(Env env, String httpDomain) throws URISyntaxException, UnknownHostException {
			this.httpDomain = httpDomain;
			this.httpDomainOk = HttpUrl.get(httpDomain);

			int numConnections = env.config().getInt("runtime.processors-x2");
			int minutesIdleBeforeClosed = 1;
			client = new OkHttpClient.Builder()
					.callTimeout(MAX_WAIT_MS, TimeUnit.MILLISECONDS)
					.connectionPool(new ConnectionPool(numConnections, minutesIdleBeforeClosed, TimeUnit.MINUTES))
					.build();

			env.onStop(client.connectionPool()::evictAll);
		}

		SocialEmbed get(String path) throws IOException {
			String body;
			{
				HttpUrl url = httpDomainOk.newBuilder().encodedPath(path).build();
				try (Response response = client.newCall(new okhttp3.Request.Builder().url(url).build()).execute()) {
					body = response.body().string();
				}
			}
			body = cleanupHeaders(body);
			if (!httpDomain.equals(HTTPS_NODE)) {
				// node.mytake.org always returns node.mytake.org URLs, even when running on dev machines
				// or the staging instance on Heroku, so we have to adjust for that here.
				body = body.replace(HTTPS_NODE, httpDomain);
			}
			return new SocialEmbed(body);
		}
	}

	/** Removes react cruft (unneeded meta closing tags and header wrapper) */
	static String cleanupHeaders(String input) {
		// if these replace calls are changed, you must sync with the Typescript socialEmbed.tsx debugging code
		return input
				.replace("<header data-reactroot=\"\">", "")
				.replace("</header>", "")
				.replace("\"/>", "\">\n");
	}

	public static void init(Jooby jooby) {
		jooby.use((env, conf, binder) -> {
			if (!isHerokuProd) {
				// everywhere besides prod, we want to show the social preview here
				env.router().get(DEV_URL, req -> socialImage.template());
			}
			String base;
			if (isHerokuProd) {
				base = HTTPS_NODE;
			} else if (env.name().equals("heroku")) {
				base = "https://mtdo-node-staging.herokuapp.com";
			} else if (env.name().equals("dev")) {
				base = HTTP_LOCAL_DEV;
			} else {
				throw Unhandled.stringException(env.name());
			}
			binder.bind(GetHeader.class).toInstance(new GetHeader(env, base));
		});
	}

	private static final String HTTPS_NODE = "https://node.mytake.org";
	private static final String HTTP_LOCAL_DEV = "http://localhost:" + NODE_DEV_PORT;
}
