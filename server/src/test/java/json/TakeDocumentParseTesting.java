/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package json;

import com.google.common.io.Resources;
import com.jsoniter.JsonIterator;
import com.jsoniter.any.Any;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.DecodingMode;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java2ts.DraftRev;
import org.assertj.core.api.Assertions;
import org.junit.Assert;
import org.junit.Test;

/**
 * We're gonna want to have server validation at some point,
 * which will involve parsing the documents.
 * 
 * Any is an easy hack for now, but we can do better someday.
 */
public class TakeDocumentParseTesting {
	@Test
	public void parseAnyDoesntChange() throws IOException {
		byte[] data = Resources.toByteArray(Resources.getResource(
				"initialdata/why-its-so-hard-to-have-peace.json"));
		Any any = JsonIterator.deserialize(data, Any.class);
		byte[] parsed = any.toString().getBytes(StandardCharsets.UTF_8);
		Assert.assertArrayEquals(data, parsed);
	}

	@Test
	public void staticParseTest() {
		JsonIterator.setMode(DecodingMode.STATIC_MODE);
		JsonStream.setMode(EncodingMode.STATIC_MODE);

		DraftRev original = new DraftRev();
		original.draftid = 4;
		original.lastrevid = 8;
		String raw = JsonStream.serialize(original);
		DraftRev roundtrip = JsonIterator.deserialize(raw, DraftRev.class);
		Assertions.assertThat(roundtrip.draftid).isEqualTo(original.draftid);
		Assertions.assertThat(roundtrip.lastrevid).isEqualTo(original.lastrevid);
	}
}
