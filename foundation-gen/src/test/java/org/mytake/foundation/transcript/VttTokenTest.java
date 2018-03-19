/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import java.util.ArrayList;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class VttTokenTest {
	@Test
	public void tokenParse() {
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
				.build();
		Assertions.assertThat(VttToken.parseLine(line)).containsExactlyElementsOf(tokens);
		Assertions.assertThat(VttToken.lineAsString(tokens)).isEqualTo(line);
	}

	@Test
	public void tokenParseFirstIsMod() {
		String line = "<c.colorCCCCCC>and<00:00:06.109><c> Republican</c></c>";
		List<VttToken> tokens = new TokensBuilder()
				.modifier("colorCCCCCC")
				.word("and")
				.time("00:00:06.109")
				.word(" Republican")
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

		public List<VttToken> build() {
			return tokens;
		}
	}
}
