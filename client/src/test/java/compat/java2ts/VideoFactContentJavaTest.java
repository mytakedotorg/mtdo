package compat.java2ts;

import java.util.Arrays;

import org.assertj.core.api.Assertions;
import org.junit.Test;

import java2ts.Foundation.Person;

public class VideoFactContentJavaTest {
	@Test
	public void roundtrip() {
		Person jack = new Person();
		jack.firstname = "Jack";
		jack.lastname = "Last";
		Person jill = new Person();
		jill.firstname = "Jill";
		jill.lastname = "Last";

		VideoFactContentJava java = new VideoFactContentJava();
		java.youtubeId = "youtube";
		java.durationSecs = 123;
		java.speakers = Arrays.asList(jack, jill);
		java.plainText = "Jack said Jill said";
		java.charOffsets = new int[] {0, 5, 10, 15};
		java.timestamps = new double[] {0, 1, 2, 3};
		java.speakerPerson = new int[] {0, 1};
		java.speakerWord = new int[] {0, 2};

		VideoFactContentJava roundtrip = VideoFactContentJava.decode(java.toEncoded());
		Assertions.assertThat(roundtrip.youtubeId).isEqualTo(java.youtubeId);
		Assertions.assertThat(roundtrip.durationSecs).isEqualTo(java.durationSecs);
		Assertions.assertThat(roundtrip.speakers).isEqualTo(java.speakers);
		Assertions.assertThat(roundtrip.plainText).isEqualTo(java.plainText);
		Assertions.assertThat(roundtrip.charOffsets).isEqualTo(java.charOffsets);
		Assertions.assertThat(roundtrip.timestamps).isEqualTo(java.timestamps);
		Assertions.assertThat(roundtrip.speakerPerson).isEqualTo(java.speakerPerson);
		Assertions.assertThat(roundtrip.speakerWord).isEqualTo(java.speakerWord);
	}
}
