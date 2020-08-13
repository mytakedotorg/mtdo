package compat.java2ts;

import java.util.Arrays;

import org.assertj.core.api.Assertions;
import org.junit.Test;

import java2ts.FT.Speaker;

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
		java.charOffsets = new int[] {0, 5, 10, 15};
		java.timestamps = new double[] {0, 1, 2, 3};
		java.turnSpeaker = new int[] {0, 1};
		java.turnWord = new int[] {0, 2};

		VideoFactContentJava roundtrip = VideoFactContentJava.decode(java.toEncoded());
		Assertions.assertThat(roundtrip.youtubeId).isEqualTo(java.youtubeId);
		Assertions.assertThat(roundtrip.durationSeconds).isEqualTo(java.durationSeconds);
		Assertions.assertThat(roundtrip.speakers).isEqualTo(java.speakers);
		Assertions.assertThat(roundtrip.plainText).isEqualTo(java.plainText);
		Assertions.assertThat(roundtrip.charOffsets).isEqualTo(java.charOffsets);
		Assertions.assertThat(roundtrip.timestamps).isEqualTo(java.timestamps);
		Assertions.assertThat(roundtrip.turnSpeaker).isEqualTo(java.turnSpeaker);
		Assertions.assertThat(roundtrip.turnWord).isEqualTo(java.turnWord);
	}
}
