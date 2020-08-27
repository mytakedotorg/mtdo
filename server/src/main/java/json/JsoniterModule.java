/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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

import com.google.inject.Binder;
import com.google.inject.multibindings.Multibinder;
import com.jsoniter.JsonIterator;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.output.JsonStreamPool;
import com.jsoniter.spi.DecodingMode;
import com.jsoniter.spi.Slice;
import com.typesafe.config.Config;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java2ts.Json;
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
		@SuppressWarnings({"rawtypes", "unchecked"})
		@Override
		public void render(Object value, Context ctx) throws Exception {
			if (value instanceof java2ts.Json) {
				JsonStream stream = JsonStreamPool.borrowJsonStream();
				try {
					stream.reset(null);
					if (value instanceof Json.JsonList) {
						stream.writeVal(((Json.JsonList) value).literal, value);
					} else {
						stream.writeVal(value);
					}

					Slice slice = stream.buffer();
					ctx.type(MediaType.json)
							.length(slice.len())
							.send(Arrays.copyOf(slice.data(), slice.len()));
				} finally {
					JsonStreamPool.returnJsonStream(stream);
				}
			} else if (value == com.diffplug.common.collect.ImmutableList.of()) {
				ctx.type(MediaType.json)
						.length(EMPTY_JSON_LIST.length)
						.send(EMPTY_JSON_LIST);
			}
		}
	}

	private static final byte[] EMPTY_JSON_LIST = "[]".getBytes(StandardCharsets.UTF_8);

	static class JsonParser implements Parser {
		@Override
		public Object parse(com.google.inject.TypeLiteral<?> type, Context ctx) throws Throwable {
			if (ctx.type().matches(MediaType.json)) {
				return ctx.ifbody(body -> JsonIterator.deserialize(body.bytes(), type.getRawType()));
			} else {
				return ctx.next();
			}
		}
	}
}
