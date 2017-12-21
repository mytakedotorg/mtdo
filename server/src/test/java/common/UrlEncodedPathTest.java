/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
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
