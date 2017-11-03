/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.common.net.UrlEscapers;
import forms.meta.MetaField;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import javax.annotation.Nullable;
import org.jooby.Mutant;
import org.jooby.Request;

public class UrlEncodedPath {
	private String path;
	private LinkedHashMap<String, String> query = new LinkedHashMap<>();

	/** Creates a UrlEncodedPath with the same host as the given request. */
	public static UrlEncodedPath absolutePath(Request req, String path) {
		String root;
		if (isSecurable(req)) {
			root = "https://" + req.hostname();
		} else {
			root = "http://" + req.hostname() + ":" + req.port();
		}
		return path(root + path);
	}

	public static UrlEncodedPath path(String path) {
		UrlEncodedPath encoded = new UrlEncodedPath();
		encoded.path = path;
		return encoded;
	}

	public <T> UrlEncodedPath param(MetaField<T> field, T value) {
		Objects.requireNonNull(field);
		Objects.requireNonNull(value);
		query.put(field.name(), UrlEscapers.urlFormParameterEscaper().escape(
				field.parser().reverse().convert(value)));
		return this;
	}

	public UrlEncodedPath paramToPath(MetaField<String> field, Request request) {
		String path = request.path();
		Optional<String> query = request.queryString();
		if (!query.isPresent()) {
			param(field, path);
		} else {
			param(field, path + "?" + query.get());
		}
		return this;
	}

	public <T> UrlEncodedPath paramIfPresent(MetaField<T> field, @Nullable T value) {
		if (value != null) {
			param(field, value);
		}
		return this;
	}

	public UrlEncodedPath copyIfPresent(Request req, MetaField<?> field) {
		Mutant param = req.param(field.name());
		if (param.isSet()) {
			query.put(field.name(), param.value());
		}
		return this;
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

	/** We allow http for local dev connections, but reauire https for everything else. */
	public static boolean isSecurable(Request req) {
		return req.hostname().endsWith(".com") || req.hostname().endsWith(".org");
	}
}
