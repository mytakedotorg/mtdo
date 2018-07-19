/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Resources;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Object;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import org.jooby.Env;
import org.jooby.Jooby;

public class OurV8 implements AutoCloseable {
	private V8 v8;

	public OurV8() {
		v8 = V8.createV8Runtime();
	}

	static class Console {
		public void log(final String message) {
			System.out.println("[V8 LOG] " + message);
		}

		public void err(final String message) {
			System.out.println("[V8 ERR] " + message);
		}
	}

	public void attachConsole() {
		Console console = new Console();
		V8Object v8Console = new V8Object(v8);
		v8.add("console", v8Console);
		v8Console.registerJavaMethod(console, "log", "log", new Class<?>[]{String.class});
		v8Console.registerJavaMethod(console, "err", "err", new Class<?>[]{String.class});
		v8Console.release();
	}

	public void executeUrl(String url) throws MalformedURLException, IOException {
		executeUrl(new URL(url));
	}

	public void executeResource(String resource) throws MalformedURLException, IOException {
		executeUrl(OurV8.class.getResource(resource));
	}

	private void executeUrl(URL url) throws IOException {
		String content = Resources.asCharSource(url, StandardCharsets.UTF_8).read();
		v8.executeScript(content);
	}

	public V8 v8() {
		return v8;
	}

	@Override
	public void close() {
		v8.terminateExecution();
		v8.release();
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
					ourV8.executeUrl("https://unpkg.com/react@15.6.2/dist/react.min.js");
					ourV8.executeResource("/assets/scripts/drawVideoFact.bundle.js");
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
