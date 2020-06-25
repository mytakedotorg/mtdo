/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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

public class FoundationMigrationTest {
	@Test
	public void testReplace() {
		FoundationMigration replacing = FoundationMigration.createReplacing("V2__video_duration_and_encode");
		Assertions.assertThat(replacing.migrate("")).isEqualTo("");
		Assertions.assertThat(replacing.migrate("abc")).isEqualTo("abc");
		// first
		Assertions.assertThat(replacing.migrate(" -7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=")).isEqualTo(" mz0GDKCE-RL1swa5u7ZugyQScNJMfpo3_FwSju6JLlo=");
		// middle
		Assertions.assertThat(replacing.migrate(" sbX7EeYl3yF5F8__vWTxwn-WHDbCDonRpZh_jw3A8kQ=")).isEqualTo(" alyIIVwUCrxC8v9_L3q7Gjh4-mjEZBShSWKVDG4bAW0=");
		// last
		Assertions.assertThat(replacing.migrate(" PKWLoZAvLLuA33KfdpM1PJiBm3XZgH-VyEizRanaf1k=")).isEqualTo(" dcrl-fARztw49lA2wg5xsM8GUZdkmK0deLZ-EuRGW2M=");

		// because we're only replacing indexes within the document, we can optimize away checking the first char
		Assertions.assertThat(replacing.migrate("PKWLoZAvLLuA33KfdpM1PJiBm3XZgH-VyEizRanaf1k=")).isEqualTo("PKWLoZAvLLuA33KfdpM1PJiBm3XZgH-VyEizRanaf1k=");

		// we can replace multiple things (first to last)
		{
			String before = " -7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM= sbX7EeYl3yF5F8__vWTxwn-WHDbCDonRpZh_jw3A8kQ= PKWLoZAvLLuA33KfdpM1PJiBm3XZgH-VyEizRanaf1k=   ";
			String expected = " mz0GDKCE-RL1swa5u7ZugyQScNJMfpo3_FwSju6JLlo= alyIIVwUCrxC8v9_L3q7Gjh4-mjEZBShSWKVDG4bAW0= dcrl-fARztw49lA2wg5xsM8GUZdkmK0deLZ-EuRGW2M=   ";
			Assertions.assertThat(replacing.migrate(before)).isEqualTo(expected);
		}

		// (and last to first)
		{
			String before = " PKWLoZAvLLuA33KfdpM1PJiBm3XZgH-VyEizRanaf1k= sbX7EeYl3yF5F8__vWTxwn-WHDbCDonRpZh_jw3A8kQ= -7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=   ";
			String expected = " dcrl-fARztw49lA2wg5xsM8GUZdkmK0deLZ-EuRGW2M= alyIIVwUCrxC8v9_L3q7Gjh4-mjEZBShSWKVDG4bAW0= mz0GDKCE-RL1swa5u7ZugyQScNJMfpo3_FwSju6JLlo=   ";
			Assertions.assertThat(replacing.migrate(before)).isEqualTo(expected);
		}
	}
}
