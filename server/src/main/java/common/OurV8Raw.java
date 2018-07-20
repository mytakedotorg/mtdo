/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.io.Resources;
import com.eclipsesource.v8.V8;
import com.eclipsesource.v8.V8Object;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/** Generic V8 manager. */
public class OurV8Raw implements AutoCloseable {
	protected final V8 v8;

	public OurV8Raw() {
		v8 = V8.createV8Runtime();
	}

	public V8 v8() {
		return v8;
	}

	@Override
	public void close() {
		v8.terminateExecution();
		v8.release();
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
		v8.executeScript(loadUrl(url));
	}

	public void executeResource(String resource) throws MalformedURLException, IOException {
		v8.executeScript(loadResource(resource));
	}

	static String loadResource(String resource) throws IOException {
		return Resources.asCharSource(OurV8.class.getResource(resource), StandardCharsets.UTF_8).read();
	}

	static String loadUrl(String url) throws IOException {
		return Resources.asCharSource(new URL(url), StandardCharsets.UTF_8).read();
	}
}
