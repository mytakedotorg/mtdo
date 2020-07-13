/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
