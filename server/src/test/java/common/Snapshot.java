/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.google.common.base.Preconditions;
import java.io.File;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.annotation.Nullable;
import javax.swing.JOptionPane;
import org.assertj.core.api.Assertions;
import org.jooby.Jooby;
import org.junit.Assert;

public class Snapshot {
	/**
	 * Pauses and displays the current and snapshot values in a browser.
	 * 
	 * @param id the name of the snapshot, must be unique per test class
	 * @param actual the value which needs to equal the snapshotted value
	 */
	public static void matchDebug(String id, String actual) {
		try {
			IdSnapshot testName = IdSnapshot.capture(id);
			String expected = testName.expected();
			if (expected.equals(actual)) {
				new OpenBrowser()
						.add("/same", actual)
						.isYes("Expected and actual match for " + testName.label());
			} else {
				boolean overwrite = new OpenBrowser()
						.add("/expected", expected)
						.add("/actual", actual)
						.isYes("Click yes to overwrite expected with actual for " + testName.label());
				if (overwrite) {
					Files.write(testName.testFile, actual.getBytes(StandardCharsets.UTF_8));
				}
			}
		} catch (ClassNotFoundException | IOException e) {
			throw Errors.asRuntime(e);
		}
	}

	/**
	 * If the snapshot doesn't match, it will block and spawn a browser
	 * to display the snapshots.
	 * 
	 * @param id the name of the snapshot, must be unique per test class
	 * @param actual the value which needs to equal the snapshotted value
	 */
	public static void match(String id, String actual) {
		try {
			IdSnapshot testName = IdSnapshot.capture(id);
			if (Files.exists(testName.testFile)) {
				Assert.assertEquals(testName.expected(), actual);
			} else {
				boolean writeSnapshot = new OpenBrowser()
						.add("/", actual)
						.isYes("Is this snapshot okay for " + testName.label());
				if (writeSnapshot) {
					Files.createDirectories(testName.testFile.getParent());
					byte[] toWrite = actual.getBytes(StandardCharsets.UTF_8);
					Files.write(testName.testFile, toWrite);
				} else {
					throw new AssertionError("User rejected");
				}
			}
		} catch (ClassNotFoundException | IOException e) {
			throw Errors.asRuntime(e);
		}
	}

	/** Opens a browser to show content. */
	static class OpenBrowser {
		Map<String, String> map = new LinkedHashMap<>();

		public OpenBrowser add(String url, String content) {
			Preconditions.checkArgument(url.startsWith("/"));
			map.put(url, content);
			return this;
		}

		public boolean isYes(String message) {
			try {
				ServerSocket socket = new ServerSocket(0);
				int port = socket.getLocalPort();
				socket.close();

				Jooby jooby = new Jooby();
				jooby.port(port);
				map.forEach((url, content) -> {
					jooby.get(url, () -> content);
				});
				jooby.start("server.join=false");

				for (String url : map.keySet()) {
					java.awt.Desktop.getDesktop().browse(new URI("http://localhost:" + port + url));
				}

				JOptionPane.getRootFrame().setAlwaysOnTop(true);
				int dialogResult = JOptionPane.showConfirmDialog(null, message);
				jooby.stop();
				return dialogResult == JOptionPane.YES_OPTION;
			} catch (Exception e) {
				throw Errors.asRuntime(e);
			}
		}
	}

	/** Represents an actual snapshot. */
	static class IdSnapshot {
		final String id;
		final String pkg;
		final String className;
		final String method;
		final Path testFile;

		static IdSnapshot capture(String id) throws ClassNotFoundException {
			StackTraceElement[] trace = Thread.currentThread().getStackTrace();
			Assertions.assertThat(trace[0].getClassName()).isEqualTo("java.lang.Thread");
			Assertions.assertThat(trace[1].getClassName()).isEqualTo("common.Snapshot$IdSnapshot");
			Assertions.assertThat(trace[2].getClassName()).isEqualTo("common.Snapshot");
			Assertions.assertThat(trace[3].getClassName()).doesNotContain("common.Snapshot");

			StackTraceElement last = trace[3];
			int lastSlash = last.getClassName().lastIndexOf('.');
			String className = last.getClassName().substring(lastSlash + 1);
			String method = last.getMethodName();
			String pkg = last.getClassName().substring(0, lastSlash);

			Path joobyRoot = new File(".").toPath();
			Path testFile = joobyRoot.resolve("src/test/java/" +
					pkg.replace('.', '/') + "/__snapshots__/" +
					className + "-" + method + "-" + id);
			return new IdSnapshot(pkg, className, method, id, testFile);
		}

		public IdSnapshot(String pkg, String className, String method, String id, Path testFile) {
			this.pkg = pkg;
			this.className = className;
			this.method = method;
			this.id = id;
			this.testFile = testFile;
		}

		@Nullable
		public String expected() throws IOException {
			if (Files.exists(testFile)) {
				return new String(Files.readAllBytes(testFile), StandardCharsets.UTF_8);
			} else {
				return null;
			}
		}

		public String label() {
			return className + "::" + method + "(" + id + ")";
		}
	}
}
