/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.eclipsesource.v8.V8Array;
import com.eclipsesource.v8.V8Object;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashSet;
import java.util.Set;
import org.jooby.Env;
import org.jooby.Jooby;

/** Manages V8 to call the funcitons we need. */
public class OurV8 extends OurV8Raw {
	final V8Object drawVideoFact;

	OurV8() throws MalformedURLException, IOException {
		executeUrl("https://unpkg.com/react@15.6.2/dist/react.min.js");
		executeResource("/assets/scripts/drawVideoFact.bundle.js");
		drawVideoFact = v8.getObject("drawVideoFact");
	}

	@Override
	public void close() {
		drawVideoFact.release();
		super.close();
	}

	public String drawVideoFact(String vidId, double start, double end) throws IOException {
		String videoFactEncoded = OurV8Raw.loadResource("/foundation-data/" + vidId + ".json");
		V8Object videoFactDecoded = (V8Object) drawVideoFact.executeJSFunction("decodeVideoFactFromStr", videoFactEncoded);

		V8Array range = new V8Array(v8);
		range.push(start);
		range.push(end);
		V8Object imageProps = (V8Object) drawVideoFact.executeJSFunction("drawVideoFact", videoFactDecoded, range);
		range.release();

		return imageProps.getString("dataUri");
	}

	/** The module for jooby integration. */
	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			OnePerThread onePerThread = new OnePerThread();
			env.onStop(onePerThread::stop);
			binder.bind(OurV8.class).toProvider(onePerThread.perThreadV8::get);
		}
	}

	/** Helper to create an OpenV8 per thread. */
	static class OnePerThread {
		private final Set<OurV8> openV8s = new HashSet<>();

		private final ThreadLocal<OurV8> perThreadV8 = new ThreadLocal<OurV8>() {
			@Override
			protected OurV8 initialValue() {
				return Errors.rethrow().get(() -> {
					OurV8 ourV8 = new OurV8();
					synchronized (openV8s) {
						openV8s.add(ourV8);
					}
					return ourV8;
				});
			}
		};

		private void stop() {
			synchronized (openV8s) {
				openV8s.forEach(OurV8::close);
			}
		}
	}
}
