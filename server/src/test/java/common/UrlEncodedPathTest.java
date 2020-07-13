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
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class UrlEncodedPathTest {
	@Test
	public void pathOnly() {
		Assertions.assertThat(
				UrlEncodedPath.path("/path").build()).isEqualTo("/path");
	}

	@Test
	public void pathAndParams() {
		Assertions.assertThat(
				UrlEncodedPath.path("/path")
						.param("first", "Rick")
						.build())
				.isEqualTo("/path?first=Rick");
		Assertions.assertThat(
				UrlEncodedPath.path("/path")
						.param("first", "Rick")
						.param("last", "Sanchez")
						.build())
				.isEqualTo("/path?first=Rick&last=Sanchez");
	}

	@Test
	public void nestedRequest() {
		String escaped = UrlEscapers.urlFormParameterEscaper().escape("?name=value");
		Assertions.assertThat(escaped).isEqualTo("%3Fname%3Dvalue");
		Assertions.assertThat(
				UrlEncodedPath.path("/login")
						.param("redirect", "path?name=value")
						.build())
				.isEqualTo("/login?redirect=path" + escaped);
	}
}
