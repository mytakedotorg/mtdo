/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import com.jsoniter.JsonIterator;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.Config;
import com.jsoniter.spi.Decoder;
import com.jsoniter.spi.Encoder;
import com.jsoniter.spi.JsoniterSpi;
import com.jsoniter.spi.TypeLiteral;
import java.io.IOException;
import java.io.OutputStream;
import jsweet.util.tuple.Tuple2;

public class JsonMisc {
	static final TypeLiteral<Tuple2<Integer, Integer>> TUPLE2 = new TypeLiteral<Tuple2<Integer, Integer>>() {};

	static {
		JsoniterSpi.registerTypeEncoder(TUPLE2, new Encoder() {
			@Override
			public void encode(Object obj, JsonStream stream) throws IOException {
				@SuppressWarnings("unchecked")
				Tuple2<Integer, Integer> cast = (Tuple2<Integer, Integer>) obj;
				stream.writeArrayStart();
				stream.writeVal(cast.$0);
				stream.writeVal(cast.$1);
				stream.writeArrayEnd();
			}
		});
		JsoniterSpi.registerTypeDecoder(TUPLE2, new Decoder() {
			@Override
			public Object decode(JsonIterator iter) throws IOException {
				iter.readArray();
				int t0 = iter.readInt();
				int t1 = iter.readInt();
				return new Tuple2<Integer, Integer>(t0, t1);
			}
		});
		CONFIG = new Config.Builder()
				.escapeUnicode(false)
				.build();
	}

	private static final Config CONFIG;

	public static void toJson(Object object, OutputStream output) {
		JsonStream.serialize(CONFIG, object, output);
	}

	public static String toJson(Object object) {
		return JsonStream.serialize(CONFIG, object);
	}

	static class Obj {
		Tuple2<Integer, Integer> tuple;
	}

	public static void main(String[] args) {
		Obj obj = JsonIterator.deserialize("{tuple: [0, 1]}", Obj.class);
		System.out.println(obj.tuple.$0 + " " + obj.tuple.$1);
	}
}
