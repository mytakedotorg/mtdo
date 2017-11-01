/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.common.net.UrlEscapers;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import javax.annotation.Nullable;
import org.jooby.Request;

public class UrlEncodedPath {
	private String path;
	private LinkedHashMap<String, String> query = new LinkedHashMap<>();

	public static UrlEncodedPath path(String path) {
		UrlEncodedPath encoded = new UrlEncodedPath();
		encoded.path = path;
		return encoded;
	}

	public UrlEncodedPath param(String key, String value) {
		Objects.requireNonNull(key);
		Objects.requireNonNull(value);
		query.put(key, UrlEscapers.urlFormParameterEscaper().escape(value));
		return this;
	}

	public UrlEncodedPath paramPathAndQuery(String key, Request request) {
		String path = request.path();
		Optional<String> query = request.queryString();
		if (!query.isPresent()) {
			param(key, path);
		} else {
			param(key, path + "?" + query.get());
		}
		return this;
	}

	public UrlEncodedPath paramIfPresent(String key, @Nullable String value) {
		if (value != null) {
			return param(key, value);
		} else {
			return this;
		}
	}

	public String build() {
		if (query.isEmpty()) {
			return path;
		} else {
			int size = path.length();
			for (Map.Entry<String, String> entry : query.entrySet()) {
				//                                =                               &
				size += entry.getKey().length() + 1 + entry.getValue().length() + 1;
			}
			// size has one extra &, and one missing ?, so it works out
			StringBuilder builder = new StringBuilder(size);
			builder.append(path);
			builder.append('?');
			Iterator<Map.Entry<String, String>> iter = query.entrySet().iterator();
			while (iter.hasNext()) {
				Map.Entry<String, String> entry = iter.next();
				builder.append(entry.getKey());
				builder.append('=');
				builder.append(entry.getValue());
				if (iter.hasNext()) {
					builder.append('&');
				}
			}
			return builder.toString();
		}
	}

	/** Returns something like `http://localhost:9000` or `https://www.diffplug.com` as appropriate. */
	public static String httpDomain(Request req) {
		if (isSecurable(req)) {
			return "https://" + req.hostname();
		} else {
			return "http://" + req.hostname() + ":" + req.port();
		}
	}

	/** We allow http for local dev connections, but reauire https for everything else. */
	public static boolean isSecurable(Request req) {
		return req.hostname().endsWith(".com");
	}
}
