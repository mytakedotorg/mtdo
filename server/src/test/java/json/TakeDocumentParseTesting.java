/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package json;

import com.google.common.io.Resources;
import com.jsoniter.JsonIterator;
import com.jsoniter.any.Any;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
}
