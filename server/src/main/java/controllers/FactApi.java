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

import com.google.common.collect.ImmutableList;
import com.google.inject.Binder;
import com.jsoniter.JsonIterator;
import com.typesafe.config.Config;
import common.RedirectException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java2ts.GhBlob;
import java2ts.Routes;
import okhttp3.OkHttpClient;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Results;

public class FactApi implements Jooby.Module {
	public static ImmutableList<String> REPOS = ImmutableList.of("us-founding-documents", "us-presidential-debates");

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.API_FACT + "/:repoIdx/:sha", req -> {
			int repoIdx = req.param("repoIdx").intValue();
			String sha = req.param("sha").value();
			if (repoIdx < 0 || repoIdx >= REPOS.size()) {
				throw RedirectException.notFoundError();
			}
			byte[] contentGitFriendly = repoSha(REPOS.get(repoIdx), sha);
			// recondense the json
			String content = recondense(new String(contentGitFriendly, StandardCharsets.UTF_8));
			return Results.json(content).header("Cache-Control",
					"max-age=31536000", // one year https://stackoverflow.com/a/25201898/1153071
					"public", // any cache may store the response
					"no-transform", // don't muck with it at all
					"immutable" // it will never change at all for sure
			);
		});
	}

	protected byte[] repoSha(String repo, String sha) throws IOException {
		// ask github
		OkHttpClient client = new OkHttpClient();
		try (okhttp3.Response res = client.newCall(new okhttp3.Request.Builder()
				.url("https://api.github.com/repos/mytakedotorg/" + repo + "/git/blobs/" + sha)
				.build()).execute()) {
			// unpack github's wrapper
			GhBlob blob = JsonIterator.deserialize(res.body().bytes(), GhBlob.class);
			return Base64.getMimeDecoder().decode(blob.content);
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
