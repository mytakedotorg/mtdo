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
package controllers;

import com.diffplug.common.base.StringPrinter;
import common.DevNoDB;
import common.JoobyDevRule;
import common.Snapshot;
import common.UserException;
import io.restassured.RestAssured;
import java.io.PrintStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ErrorPagesTest {
	static class App extends DevNoDB {
		App() {
			use(new ErrorPages());
			get("/userError", req -> {
				throw new UserException("We have something to tell you.");
			});
			get("/internalError", req -> {
				throw new IllegalArgumentException("Oh noes!!");
			});
			get("/key", req -> "open");
		}
	}

	@ClassRule
	public static JoobyDevRule dev = new JoobyDevRule(new App());

	@Test
	public void _00_testUserError() {
		Snapshot.match("testUserError", RestAssured.get("/userError"));
	}

	@Test
	public void _00a_testHead() {
		RestAssured.head("/key")
				.then()
				.statusCode(405);
	}

	@Test
	public void _01_test404() {
		Snapshot.match("test404", RestAssured.get("/doesntExist"));
	}

	@Test
	public void _02_testInternal() {
		PrintStream errStream = System.err;
		try {
			StringBuffer buffer = new StringBuffer();
			StringPrinter printer = new StringPrinter(buffer::append);
			PrintStream errCapture = printer.toPrintStream();
			System.setErr(errCapture);
			Snapshot.match("testInternalUser", RestAssured.get("/internalError"));
			errCapture.close();
			Snapshot.match("_02_testInternalConsole", cleanup("Internal error", "stacktrace=", buffer.toString()));
			Snapshot.match("_02_testInternalDevEmail", cleanup("<html>", "stacktrace=", dev.waitForEmail().bodyRaw()));
		} finally {
			System.setErr(errStream);
		}
	}

	/** So that tests don't require a specific build of JVM. */
	private static String cleanup(String before, String after, String raw) {
		Matcher matcher = Pattern.compile(Pattern.quote(before) + "([\\s\\S]*)" + Pattern.quote(after)).matcher(raw);
		matcher.find();
		return matcher.group(1).replaceAll("\\(Java/.*\\)", "");
	}
}
