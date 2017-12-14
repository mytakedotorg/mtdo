/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package json;

import com.google.inject.Binder;
import com.google.inject.multibindings.Multibinder;
import com.jsoniter.JsonIterator;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.output.JsonStreamPool;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.Slice;
import com.typesafe.config.Config;
import java.util.Arrays;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.MediaType;
import org.jooby.Parser;
import org.jooby.Renderer;

/**
 * We are currently using Jsoniter in its slowest, reflection-based mode.
 * There are faster modes available: http://jsoniter.com/java-features.html#performance-is-optional
 */
public class JsoniterModule implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		JsonIterator.setMode(DecodingMode.STATIC_MODE);
		JsonStream.setMode(EncodingMode.STATIC_MODE);
		Multibinder.newSetBinder(binder, Renderer.class)
				.addBinding()
				.toInstance(new JsonRenderer());
		Multibinder.newSetBinder(binder, Parser.class)
				.addBinding()
				.toInstance(new JsonParser());
	}

	static class JsonRenderer implements Renderer {
		@Override
		public void render(Object value, Context ctx) throws Exception {
			if (value instanceof java2ts.Json) {
				JsonStream stream = JsonStreamPool.borrowJsonStream();
				try {
					stream.reset(null);
					stream.writeVal(value);
					Slice slice = stream.buffer();
					ctx.type(MediaType.json)
							.length(slice.len())
							.send(Arrays.copyOf(slice.data(), slice.len()));
				} finally {
					JsonStreamPool.returnJsonStream(stream);
				}
			}
		}
	}

	static class JsonParser implements Parser {
		@Override
		public Object parse(com.google.inject.TypeLiteral<?> type, Context ctx) throws Throwable {
			if (ctx.type().matches(MediaType.json)) {
				return ctx.ifbody(body -> {
					return JsonIterator.deserialize(body.bytes(), type.getRawType());
				});
			} else {
				return ctx.next();
			}
		}
	}
}
