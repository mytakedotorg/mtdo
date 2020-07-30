/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package common;

import com.diffplug.common.base.Errors;
import com.google.common.html.HtmlEscapers;
import io.restassured.response.Response;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.function.Function;
import javax.annotation.Nullable;
import org.assertj.core.api.AbstractCharSequenceAssert;
import org.assertj.core.api.Assertions;
import org.junit.Assert;

public class Snapshot {
	/** Special match where the input model will have its userOpt and assets injected. */
	public static AbstractCharSequenceAssert<?, String> match(String id, CustomRockerModel actual) {
		return match(id, actual.renderTest());
	}

	/** See {@link #match(String, String) */
	public static AbstractCharSequenceAssert<?, String> match(String id, Response response) {
		String asStr = response.asString();
		if (asStr.isEmpty()) {
			asStr = "Status code: " + response.statusCode() + "\n" + response.headers();
		}
		return match(id, asStr);
	}

	/** Returns true iff SET_SNAPSHOTS=TRUE */
	private static boolean setSnapshots() {
		return "TRUE".equals(System.getProperty("SET_SNAPSHOTS"));
	}

	/**
	 * If the snapshot doesn't match, it will block and spawn a browser
	 * to display the snapshots.
	 * 
	 * @param id the name of the snapshot, must be unique per test class
	 * @param actual the value which needs to equal the snapshotted value
	 * @return 
	 */
	public static AbstractCharSequenceAssert<?, String> match(String id, String actual) {
		Function<String, String> transformForView;
		if (actual.isEmpty() || actual.trim().charAt(0) == '<') {
			// html
			transformForView = Function.identity();
		} else {
			transformForView = raw -> HtmlEscapers.htmlEscaper().escape(raw).replace("\n", "<br>");
		}
		try {
			IdSnapshot snapshot = IdSnapshot.capture(id);
			if (Files.exists(snapshot.testFile)) {
				try {
					Function<String, String> clean = in -> in.replaceAll("\r", "").replaceAll("\n+", "\n");
					String expectedClean = clean.apply(snapshot.expected());
					String actualClean = clean.apply(actual);
					Assert.assertEquals(expectedClean, actualClean);
				} catch (Error e) {
					if (setSnapshots()) {
						Files.write(snapshot.testFile, actual.getBytes(StandardCharsets.UTF_8));
					} else if (OpenBrowser.isInteractive()) {
						e.printStackTrace();
						boolean overwrite = new OpenBrowser()
								.add("/expected", transformForView.apply(snapshot.expected()))
								.add("/actual", transformForView.apply(actual))
								.isYes("Overwrite expected with actual for " + snapshot.label());
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
				boolean writeSnapshot = setSnapshots() || (new OpenBrowser()
						.add("/first", transformForView.apply(actual))
						.isYes("Is this snapshot okay for " + snapshot.label()));
				if (writeSnapshot) {
					Files.createDirectories(snapshot.testFile.getParent());
					byte[] toWrite = actual.getBytes(StandardCharsets.UTF_8);
					Files.write(snapshot.testFile, toWrite);
				} else {
					throw new AssertionError("User rejected");
				}
			}
			return Assertions.assertThat(actual);
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
			StackTraceElement last;
			if (trace[3].getClassName().contains("common.Snapshot")) {
				last = trace[4];
			} else {
				last = trace[3];
			}

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
