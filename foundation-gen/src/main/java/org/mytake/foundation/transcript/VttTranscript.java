/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.StringPrinter;
import com.google.auto.value.AutoValue;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

@AutoValue
public abstract class VttTranscript {
	public abstract String header();

	public abstract List<Line> lines();

	@AutoValue
	public static abstract class Line {
		public abstract LineHeader lineHeader();

		public abstract List<VttToken> tokens();
	}

	@AutoValue
	public static abstract class LineHeader {
		public abstract double start();

		public abstract double end();

		public abstract String formatting();

		private static final String ARROW = " --> ";

		public static LineHeader parse(String input) {
			int arrowIdx = input.indexOf(ARROW);
			double start = str2ts(input.substring(0, arrowIdx));
			int nextStart = arrowIdx + ARROW.length();
			int spaceIdx = input.indexOf(' ', nextStart);
			double end = str2ts(input.substring(nextStart, spaceIdx));
			String formatting = input.substring(spaceIdx + 1);
			return new AutoValue_VttTranscript_LineHeader(start, end, formatting);
		}

		public String asString() {
			return ts2str(start()) + ARROW + ts2str(end()) + " " + formatting();
		}
	}

	public static VttTranscript parse(String toRead) throws IOException {
		try (BufferedReader reader = new BufferedReader(new StringReader(toRead))) {
			return parse(reader);
		}
	}

	public static VttTranscript parse(BufferedReader reader) throws IOException {
		int lineCount = 1;

		StringBuilder headerStr = new StringBuilder();
		String line;
		while (!(line = reader.readLine()).isEmpty()) {
			headerStr.append(line);
			headerStr.append("\n");
			++lineCount;
		}

		try {
			List<Line> lines = new ArrayList<>();
			while (true) {
				String headerLine = reader.readLine();
				String tokenLine = reader.readLine();
				if (tokenLine == null) {
					break;
				}

				++lineCount;
				LineHeader header = LineHeader.parse(headerLine);
				++lineCount;
				List<VttToken> tokens = VttToken.parseLine(tokenLine);
				++lineCount;
				lines.add(new AutoValue_VttTranscript_Line(header, tokens));

				String emptyLine = reader.readLine();
				if (emptyLine == null) {
					break;
				} else {
					Preconditions.checkArgument(emptyLine.isEmpty());
				}
			}
			return new AutoValue_VttTranscript(headerStr.toString(), lines);
		} catch (Exception e) {
			throw new RuntimeException("On line " + lineCount, e);
		}
	}

	public String asString() {
		return StringPrinter.buildString(printer -> {
			printer.println(header());
			for (Line line : lines()) {
				printer.println(line.lineHeader().asString());
				printer.println(VttToken.lineAsString(line.tokens()));
				printer.println("");
			}
		});
	}

	static String ts2str(double ts) {
		int totalMinutes = (int) Math.floor(ts / 60.0);
		int ms = (int) Math.round((ts - totalMinutes * 60) * 1000.0);
		int MS = ms % 1000;
		int SS = ms / 1000;
		int MM = totalMinutes % 60;
		int HH = totalMinutes / 60;
		return String.format("%02d:%02d:%02d.%03d", HH, MM, SS, MS);
	}

	static double str2ts(String str) {
		String[] pieces = str.split(":");
		// parse data string in form HH:MM:SS.SSS
		int HH = Integer.parseInt(pieces[0]);
		int MM = Integer.parseInt(pieces[1]);
		double SS = Double.parseDouble(pieces[2]);
		// convert HHMMSS to seconds
		return HH * 60 * 60 + MM * 60 + SS;
	}
}
