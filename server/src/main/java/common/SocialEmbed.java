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
import java.nio.charset.StandardCharsets;
import java2ts.Routes;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.util.EntityUtils;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Request;
import views.SocialEmbed.socialImage;

public class SocialEmbed {
	public static final String DEV_SOCIAL_IMAGE = Routes.API + "/dev/socialImage/";
	public static final String NODE_SOCIAL_HEADERS = "/static/social-header/";
	public static final String NODE_SOCIAL_IMAGE = "/static/social-image/";

	private static final int MAX_WAIT_MS = 500;
	private static final int NODE_DEV_PORT = 4000;
	private static final boolean isHerokuProd = "true".equals(System.getenv("HEROKU_NAKED_PROD"));

	public static SocialEmbed get(Request req, String embedRison) throws IOException {
		return req.require(GetHeader.class).get(NODE_SOCIAL_HEADERS + embedRison);
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
		private final PoolingHttpClientConnectionManager connectionPool;
		private final RequestConfig requestCfg;

		private GetHeader(Env env, String httpDomain) throws URISyntaxException, UnknownHostException {
			if (httpDomain.isEmpty()) {
				httpDomain = "http://localhost:" + NODE_DEV_PORT;
			}
			this.httpDomain = httpDomain;

			//			if (httpDomain.isEmpty()) {
			//				host = new HttpHost(InetAddress.getLocalHost(), NODE_DEV_PORT);
			//			} else {
			//				URI uri = new URI(httpDomain);
			//				host = new HttpHost(uri.getHost());
			//			}

			connectionPool = new PoolingHttpClientConnectionManager();
			int numConnections = env.config().getInt("runtime.processors-x2");
			connectionPool.setMaxTotal(numConnections);
			connectionPool.setDefaultMaxPerRoute(numConnections);

			requestCfg = RequestConfig.custom()
					.setConnectTimeout(MAX_WAIT_MS)
					.setConnectionRequestTimeout(MAX_WAIT_MS)
					.build();
		}

		SocialEmbed get(String path) throws IOException {
			String body;
			try (CloseableHttpClient client = HttpClients.custom()
					.setConnectionManager(connectionPool)
					.setDefaultRequestConfig(requestCfg)
					.build();
					CloseableHttpResponse response = client.execute(new HttpGet(httpDomain + path))) {
				body = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
				EntityUtils.consume(response.getEntity());
			}
			System.out.println("#################");
			System.out.println(body);
			return new SocialEmbed(body);
		}
	}

	public static void init(Jooby jooby) {
		jooby.use((env, conf, binder) -> {
			if (isHerokuProd) {
				// everywhere besides prod, we want to rewr
				env.router().get(DEV_SOCIAL_IMAGE, req -> socialImage.template());
			}
			String base;
			if (isHerokuProd) {
				base = "https://node.mytake.org";
			} else if (env.name().equals("heroku")) {
				base = "https://mtdo-node-staging.herokuapp.com";
			} else if (env.name().equals("dev")) {
				base = "";
			} else {
				throw Unhandled.stringException(env.name());
			}
			binder.bind(GetHeader.class).toInstance(new GetHeader(env, base));
		});
	}
}
