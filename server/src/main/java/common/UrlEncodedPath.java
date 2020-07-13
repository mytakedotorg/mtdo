/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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

	public UrlEncodedPath param(String field, String value) {
		Objects.requireNonNull(field);
		Objects.requireNonNull(value);
		query.put(field, value);
		return this;
	}

	public <T> UrlEncodedPath param(MetaField<T> field, T value) {
		return param(field.name(), field.parser().reverse().convert(value));
	}

	public UrlEncodedPath paramPathAndQuery(MetaField<String> field, Request request) {
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

	public UrlEncodedPath paramIfPresent(MetaField<?> field, Request req) {
		Mutant param = req.param(field.name());
		if (param.isSet()) {
			param(field.name(), param.value());
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
				builder.append(UrlEscapers.urlFormParameterEscaper().escape(entry.getValue()));
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
