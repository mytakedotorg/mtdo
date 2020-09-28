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
package controllers;

import com.diffplug.common.collect.ImmutableMap;
import com.google.inject.Binder;
import com.jsoniter.JsonIterator;
import com.typesafe.config.Config;
import common.RedirectException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java2ts.GhBlob;
import java2ts.Routes;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Results;
import org.jooby.Status;

public class FactApi implements Jooby.Module {
	/** Requests are allowed for only the given factsets. */
	protected static ImmutableMap<String, String> ALLOWED_FACTSETS = ImmutableMap.of("E74aoUY", "us-presidential-debates");

	private String githubAuth;

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		String githubUser = System.getProperty("GITHUB_USER");
		if (githubUser != null) {
			String githubSecret = System.getProperty("GITHUB_SECRET");
			if (githubSecret != null) {
				githubAuth = Credentials.basic(githubUser, githubSecret);
			}
		}

		env.router().get(Routes.API_FACT + "/**", req -> {
			String factHash = req.rawPath().substring(Routes.API_FACT.length() + 1);
			if (factHash.length() != 48) {
				throw RedirectException.notFoundError();
			}

			String factsetId = factHash.substring(0, 7);
			String sha = factHash.substring(8);
			String repo = ALLOWED_FACTSETS.get(factsetId);
			if (repo == null) {
				throw RedirectException.notFoundError();
			}
			byte[] contentGitFriendly = repoSha(repo, sha);
			// recondense the json
			String content = recondense(new String(contentGitFriendly, StandardCharsets.UTF_8));
			return Results.json(content)
					.header("Access-Control-Allow-Origin", "*")
					.header("Cache-Control",
							"max-age=31536000", // one year https://stackoverflow.com/a/25201898/1153071
							"public", // any cache may store the response
							"no-transform", // don't muck with it at all
							"immutable" // it will never change at all for sure
			);
		});
	}

	protected byte[] repoSha(String repo, String sha) throws IOException {
		okhttp3.Request.Builder request = new okhttp3.Request.Builder()
				.url("https://api.github.com/repos/mytakedotorg/" + repo + "/git/blobs/" + sha);
		if (githubAuth != null) {
			request = request.addHeader("Authorization", githubAuth);
		}

		OkHttpClient client = new OkHttpClient();
		try (okhttp3.Response res = client.newCall(request.build()).execute()) {
			if (res.code() == Status.NOT_FOUND.value()) {
				throw RedirectException.notFoundError();
			}
			byte[] body = res.body().bytes();
			try {
				GhBlob blob = JsonIterator.deserialize(body, GhBlob.class);
				return Base64.getMimeDecoder().decode(blob.content);
			} catch (Exception e) {
				throw new IllegalArgumentException("Bad GitHub resoonse to: " + "https://api.github.com/repos/mytakedotorg/" + repo + "/git/blobs/" + sha + "\n\n" + new String(body, StandardCharsets.UTF_8), e);
			}
		}
	}

	// From GitJson.recondense
	private static final char COMMENT_OPEN = '⌊';
	private static final char COMMENT_CLOSE = '⌋';

	static String recondense(String in) {
		StringBuilder buffer = new StringBuilder(in.length());
		int start = 0;
		int next;
		while ((next = nextParsePaint(in, start)) != 0) {
			if (next > 0) {
				// was '\n'
				buffer.append(in, start, next);
				start = next + 1; // skip the \n
			} else {
				// was ⌊, ignore everything up to the next ⌋
				buffer.append(in, start, -next);
				int close = in.indexOf(COMMENT_CLOSE, -next + 1);
				if (close == -1) {
					return buffer.toString();
				} else {
					start = close + 1;
				}
			}
		}
		if (start < in.length()) {
			buffer.append(in, start, in.length());
		}
		return buffer.toString();
	}

	private static int nextParsePaint(String in, int startFrom) {
		for (int i = startFrom; i < in.length(); ++i) {
			char c = in.charAt(i);
			if (c == '\n') {
				return i;
			} else if (c == COMMENT_OPEN) {
				return -i;
			}
		}
		return 0; // signifies end of string
	}
}
