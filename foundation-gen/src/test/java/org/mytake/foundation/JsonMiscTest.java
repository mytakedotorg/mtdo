/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.jsoniter.JsonIterator;
import java2ts.Foundation.SpeakerMap;
import jsweet.util.tuple.Tuple2;
import org.assertj.core.api.Assertions;
import org.junit.Test;

public class JsonMiscTest {
	static {
		JsonMisc.init();
	}

	@Test
	public void toJson() {
		SpeakerMap speakerMap = new SpeakerMap();
		speakerMap.speaker = "somebody";
		speakerMap.range = new Tuple2<>(0, 1);
		Assertions.assertThat(JsonMisc.toJson(speakerMap)).isEqualTo("{\"speaker\":\"somebody\",\"range\":[0,1]}");
	}

	@Test
	public void fromJson() {
		SpeakerMap speakerMap = JsonIterator.deserialize("{\"speaker\":\"somebody\",\"range\":[0,1]}", SpeakerMap.class);
		Assertions.assertThat(speakerMap.speaker).isEqualTo("somebody");
		Assertions.assertThat(speakerMap.range.$0).isEqualTo(0);
		Assertions.assertThat(speakerMap.range.$1).isEqualTo(1);
	}
}
