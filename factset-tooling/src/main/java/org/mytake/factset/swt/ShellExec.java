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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.swt;


import com.diffplug.common.base.Errors;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.spotless.FileSignature;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;
import org.mytake.factset.video.Ingredients;

public class ShellExec {
	public static void winUnix(StringPrinter printer, File cwd, String win, String unix, Function<String, PaneInput> onBadExitCode) throws IOException {
		ExecutorService threadStdOut = Executors.newSingleThreadExecutor();
		ExecutorService threadStdErr = Executors.newSingleThreadExecutor();
		// create a StringPrinter which stores output **and** forwards to the parent printer 
		StringBuilder builder = new StringBuilder();
		StringPrinter tee = new StringPrinter(str -> {
			synchronized (builder) {
				builder.append(str);
			}
			printer.print(str);
		});
		try (OutputStream output = tee.toOutputStream()) {
			List<String> args;
			if (FileSignature.machineIsWin()) {
				args = Arrays.asList("cmd", "/c", win);
			} else {
				args = Arrays.asList("sh", "-c", unix);
			}
			Process process = new ProcessBuilder(args)
					.directory(cwd)
					.start();
			threadStdOut.submit(() -> drain(process.getInputStream(), output));
			threadStdErr.submit(() -> drain(process.getErrorStream(), output));
			// wait for the process to finish
			int exitCode = process.waitFor();
			if (exitCode != 0) {
				output.close();
				String str = builder.toString();
				throw new ExitCodeNotZeroException(exitCode, str, onBadExitCode.apply(str));
			}
		} catch (InterruptedException e) {
			throw Errors.asRuntime(e);
		}
	}

	public static void gradlew(StringPrinter printer, Ingredients folder, String cmd) throws IOException {
		winUnix(printer, folder.folder().getParentFile(), "gradlew " + cmd, "./gradlew " + cmd, consoleOutput -> {
			int start = consoleOutput.indexOf(Ingredients.PROBLEM_IN_START);
			if (start == -1) {
				return null;
			}
			int end = consoleOutput.indexOf(Ingredients.PROBLEM_IN_END, start + Ingredients.PROBLEM_IN_START.length());
			if (end == -1) {
				return null;
			}
			String result = consoleOutput.substring(start + Ingredients.PROBLEM_IN_START.length(), end);
			if (result.startsWith(Ingredients.VIDEO_MATCH)) {
				return PaneInput.videoMatch(folder, result.substring(Ingredients.VIDEO_MATCH.length()));
			} else {
				return PaneInput.path(folder.folder().toPath().resolve(result));
			}
		});
	}

	@SuppressWarnings("serial")
	public static class ExitCodeNotZeroException extends RuntimeException {
		public final int exitCode;
		public final String consoleOutput;
		public final PaneInput paneInput;

		public ExitCodeNotZeroException(int exitCode, String consoleOutput, PaneInput paneInput) {
			this.exitCode = exitCode;
			this.consoleOutput = consoleOutput;
			this.paneInput = paneInput;
		}

		@Override
		public String getMessage() {
			if (paneInput != null) {
				return "Error in " + paneInput.tabTxt();
			} else {
				return "Error";
			}
		}
	}

	private static void drain(InputStream input, OutputStream output) {
		byte[] buf = new byte[1024];
		int numRead;
		try {
			while ((numRead = input.read(buf)) != -1) {
				output.write(buf, 0, numRead);
			}
		} catch (IOException e) {
			throw Errors.asRuntime(e);
		}
	}
}
