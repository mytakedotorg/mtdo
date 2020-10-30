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

import org.jooby.Response;

public class CacheControl {
	public static Response forever(Response res) {
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
		return res.header("Cache-Control", "public, max-age=31536000, immutable");
	}

	public static Response hour(Response res) {
		// https://support.cloudflare.com/hc/en-us/articles/202775670-Customizing-Cloudflare-s-cache#:~:text=Cache%20additional%20content%20at%20Cloudflare,-Caching%20additional%20content&text=Do%20not%20use%20Cache%20Everything,Cache%20Level%20set%20to%20Bypass.
		return res.header("Cache-Control", "public, max-age=3600, immutable");
	}

	public static Response bypass(Response res) {
		// https://support.cloudflare.com/hc/en-us/articles/202775670-Customizing-Cloudflare-s-cache#:~:text=Cache%20additional%20content%20at%20Cloudflare,-Caching%20additional%20content&text=Do%20not%20use%20Cache%20Everything,Cache%20Level%20set%20to%20Bypass.
		return res.header("Cache-Control", "no-cache");
	}

	public static Response corsAllowAll(Response res) {
		return res.header("Access-Control-Allow-Origin", "*");
	}
}
