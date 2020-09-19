/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.fact.transcript;


import java.util.ArrayList;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class VttTokenTest {
	@Test
	public void regularLine() {
		String line = "good<00:00:01.890><c> evening</c><00:00:02.070><c> I'm</c><00:00:02.520><c> Pauline</c><c.colorCCCCCC><00:00:02.939><c> frederick</c><00:00:03.419><c> of</c></c>";
		List<VttToken> tokens = new TokensBuilder()
				.word("good")
				.time("00:00:01.890")
				.word(" evening")
				.time("00:00:02.070")
				.word(" I'm")
				.time("00:00:02.520")
				.word(" Pauline")
				.modifier("colorCCCCCC")
				.time("00:00:02.939")
				.word(" frederick")
				.time("00:00:03.419")
				.word(" of")
				.close()
				.build();
		Assertions.assertThat(VttToken.parseLine(line)).containsExactlyElementsOf(tokens);
		Assertions.assertThat(VttToken.lineAsString(tokens)).isEqualTo(line);
	}

	@Test
	public void firstIsModNoClose() {
		String line = "<c.colorCCCCCC>and<00:00:06.109><c> Republican</c>";
		List<VttToken> tokens = new TokensBuilder()
				.modifier("colorCCCCCC")
				.word("and")
				.time("00:00:06.109")
				.word(" Republican")
				.build();
		Assertions.assertThat(VttToken.parseLine(line)).containsExactlyElementsOf(tokens);
		Assertions.assertThat(VttToken.lineAsString(tokens)).isEqualTo(line);
	}

	@Test
	public void oneWord() {
		String line = "country";
		List<VttToken> tokens = new TokensBuilder()
				.word("country")
				.build();
		Assertions.assertThat(VttToken.parseLine(line)).containsExactlyElementsOf(tokens);
		Assertions.assertThat(VttToken.lineAsString(tokens)).isEqualTo(line);
	}

	public static class TokensBuilder {
		private final List<VttToken> tokens = new ArrayList<>();

		private TokensBuilder add(VttToken token) {
			tokens.add(token);
			return this;
		}

		public TokensBuilder word(String word) {
			return add(new VttToken.Word(word));
		}

		public TokensBuilder time(String time) {
			return add(new VttToken.Time(VttTranscript.str2ts(time)));
		}

		public TokensBuilder modifier(String modifier) {
			return add(new VttToken.Mod(modifier));
		}

		public TokensBuilder close() {
			return add(new VttToken.UnexpectedClose());
		}

		public List<VttToken> build() {
			return tokens;
		}
	}
}
