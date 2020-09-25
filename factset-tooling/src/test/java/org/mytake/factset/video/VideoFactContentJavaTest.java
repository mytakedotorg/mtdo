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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.video;


import java.util.Arrays;
import java2ts.FT.Speaker;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class VideoFactContentJavaTest {
	@Test
	public void roundtrip() {
		Speaker jack = new Speaker();
		jack.fullName = "Jack Last";
		jack.role = "Hill climber";
		Speaker jill = new Speaker();
		jill.fullName = "Jill Last";
		jill.role = "Water fetcher";

		VideoFactContentJava java = new VideoFactContentJava();
		java.youtubeId = "youtube";
		java.durationSeconds = 123;
		java.speakers = Arrays.asList(jack, jill);
		java.plainText = "Jack said Jill said";
		java.wordChar = new int[]{0, 5, 10, 15};
		java.wordTime = new double[]{0, 1, 2, 3};
		java.turnSpeaker = new int[]{0, 1};
		java.turnWord = new int[]{0, 2};

		VideoFactContentJava roundtrip = VideoFactContentJava.decode(java.toEncoded());
		Assertions.assertThat(roundtrip.youtubeId).isEqualTo(java.youtubeId);
		Assertions.assertThat(roundtrip.durationSeconds).isEqualTo(java.durationSeconds);
		Assertions.assertThat(roundtrip.speakers).isEqualTo(java.speakers);
		Assertions.assertThat(roundtrip.plainText).isEqualTo(java.plainText);
		Assertions.assertThat(roundtrip.wordChar).isEqualTo(java.wordChar);
		Assertions.assertThat(roundtrip.wordTime).isEqualTo(java.wordTime);
		Assertions.assertThat(roundtrip.turnSpeaker).isEqualTo(java.turnSpeaker);
		Assertions.assertThat(roundtrip.turnWord).isEqualTo(java.turnWord);
	}
}
