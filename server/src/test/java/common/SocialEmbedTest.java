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

import org.assertj.core.api.Assertions;
import org.junit.Test;

public class SocialEmbedTest {
	@Test
	public void cleanup() {
		String fromServer = "<header data-reactroot=\"\"><meta name=\"twitter:card\" content=\"summary_large_image\"/><meta name=\"twitter:site\" content=\"@mytakedotorg\"/><meta name=\"twitter:title\" content=\"Presidential Debate - Clinton, Trump (2 of 3)\"/><meta name=\"twitter:description\" content=\"TODO\"/><meta name=\"twitter:image\" content=\"http://localhost:4000/static/social-header/cut:!(2361.449951171875,2378.56005859375),fact:&#x27;1b7OOH2CJQjbBSDkuo2L9MVFp5UKRpaavk4fotdq2Ds=&#x27;,kind:videoCut\"/><meta name=\"twitter:image:alt\" content=\"\"/></header>";
		Assertions.assertThat(SocialEmbed.cleanupHeaders(fromServer)).isEqualTo(
				"<meta name=\"twitter:card\" content=\"summary_large_image\">\n" +
						"<meta name=\"twitter:site\" content=\"@mytakedotorg\">\n" +
						"<meta name=\"twitter:title\" content=\"Presidential Debate - Clinton, Trump (2 of 3)\">\n" +
						"<meta name=\"twitter:description\" content=\"TODO\">\n" +
						"<meta name=\"twitter:image\" content=\"http://localhost:4000/static/social-header/cut:!(2361.449951171875,2378.56005859375),fact:&#x27;1b7OOH2CJQjbBSDkuo2L9MVFp5UKRpaavk4fotdq2Ds=&#x27;,kind:videoCut\">\n" +
						"<meta name=\"twitter:image:alt\" content=\"\">\n");
	}
}
