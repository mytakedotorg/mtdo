/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import com.diffplug.common.base.Preconditions;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.Config;
import com.jsoniter.spi.JsoniterSpi;
import java.io.OutputStream;
import java2ts.Foundation.SpeakerMap;
import jsweet.util.tuple.Tuple2;

public class JsonMisc {
	static void init() {
		JsoniterSpi.registerPropertyEncoder(SpeakerMap.class, "range", (obj, stream) -> {
			@SuppressWarnings("unchecked")
			Tuple2<Integer, Integer> cast = (Tuple2<Integer, Integer>) obj;
			stream.writeArrayStart();
			stream.writeVal(cast.$0);
			stream.writeMore();
			stream.writeVal(cast.$1);
			stream.writeArrayEnd();
		});
		JsoniterSpi.registerPropertyDecoder(SpeakerMap.class, "range", iter -> {
			Preconditions.checkArgument(iter.readArray());
			int t0 = iter.readInt();
			Preconditions.checkArgument(iter.readArray());
			int t1 = iter.readInt();
			Preconditions.checkArgument(!iter.readArray());
			return new Tuple2<Integer, Integer>(t0, t1);
		});
		Config config = JsoniterSpi.getCurrentConfig().copyBuilder()
				.escapeUnicode(false)
				.build();
		JsoniterSpi.setCurrentConfig(config);
		JsoniterSpi.setDefaultConfig(config);
	}

	static {
		init();
		CONFIG = new Config.Builder()
				.escapeUnicode(false)
				.build();
	}

	private static final Config CONFIG;

	public static void toJson(Object object, OutputStream output) {
		JsonStream.serialize(CONFIG, object, output);
	}

	public static String toJson(Object object) {
		return JsonStream.serialize(object);
	}
}
