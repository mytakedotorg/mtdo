/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.annotation.Nullable;
import org.assertj.core.api.Assertions;
import org.junit.Assert;

public class Snapshot {
	/**
	 * If the snapshot doesn't match, it will block and spawn a browser
	 * to display the snapshots.
	 * 
	 * @param id the name of the snapshot, must be unique per test class
	 * @param actual the value which needs to equal the snapshotted value
	 */
	public static void match(String id, String actual) {
		try {
			IdSnapshot snapshot = IdSnapshot.capture(id);
			if (Files.exists(snapshot.testFile)) {
				try {
					Assert.assertEquals(snapshot.expected(), actual);
				} catch (Error e) {
					if (OpenBrowser.isInteractive()) {
						e.printStackTrace();
						boolean overwrite = new OpenBrowser()
								.add("/expected", snapshot.expected())
								.add("/actual", actual)
								.isYes("Click yes to overwrite expected with actual for " + snapshot.label());
						if (overwrite) {
							Files.write(snapshot.testFile, actual.getBytes(StandardCharsets.UTF_8));
						} else {
							throw e;
						}
					} else {
						throw e;
					}
				}
			} else {
				Assert.assertTrue("No snapshot for " + id, OpenBrowser.isInteractive());
				boolean writeSnapshot = new OpenBrowser()
						.add("/", actual)
						.isYes("Is this snapshot okay for " + snapshot.label());
				if (writeSnapshot) {
					Files.createDirectories(snapshot.testFile.getParent());
					byte[] toWrite = actual.getBytes(StandardCharsets.UTF_8);
					Files.write(snapshot.testFile, toWrite);
				} else {
					throw new AssertionError("User rejected");
				}
			}
		} catch (ClassNotFoundException | IOException e) {
			throw Errors.asRuntime(e);
		}
	}

	/** Represents an actual snapshot. */
	static class IdSnapshot {
		final String id;
		final String pkg;
		final String className;
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
			String pkg = last.getClassName().substring(0, lastSlash);

			Path joobyRoot = new File(".").toPath();
			Path testFile = joobyRoot.resolve("src/test/java/" +
					pkg.replace('.', '/') + "/__snapshots__/" +
					className + "-" + id);
			return new IdSnapshot(pkg, className, id, testFile);
		}

		public IdSnapshot(String pkg, String className, String id, Path testFile) {
			this.pkg = pkg;
			this.className = className;
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
			return className + "(" + id + ")";
		}
	}
}
