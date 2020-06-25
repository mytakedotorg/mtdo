/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2018 MyTake.org, Inc.
 * 
 * The MyTake.org transcript GUI is licensed under EPLv2
 * because SWT is incompatible with AGPLv3, the rest of
 * MyTake.org is licensed under AGPLv3.
 *
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Preconditions;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Unhandled;
import com.diffplug.common.io.CharSink;
import com.diffplug.common.io.CharSource;
import com.diffplug.common.io.Files;
import com.google.auto.value.AutoValue;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import javax.annotation.Nullable;
import org.eclipse.jgit.diff.Edit;

@AutoValue
public abstract class VttTranscript {
	public enum Mode {
		PERMISSIVE, STRICT;
	}

	public abstract String header();

	public abstract List<Line> lines();

	public List<Word.Vtt> words() {
		List<Word.Vtt> words = new ArrayList<>();
		for (Line line : lines()) {
			line.addWords(words);
		}
		return words;
	}

	@AutoValue
	public static abstract class Line {
		public abstract LineHeader header();

		public abstract List<VttToken> tokens();

		void addWords(List<Word.Vtt> words) {
			double time = header().start();
			for (VttToken token : tokens()) {
				if (token.isTime()) {
					time = token.assertTime().timestamp;
				} else if (token.isWord()) {
					String rawWord = token.assertWord().word.trim();
					if (!rawWord.isEmpty()) {
						Word.Vtt word = new Word.Vtt(rawWord, time);
						if (!word.lowercase.isEmpty()) {
							words.add(word);
						}
					}
				}
			}
		}

		public static Line create(LineHeader template, List<Word.Vtt> words, double nextStart) {
			Iterator<Word.Vtt> wordIter = words.iterator();
			Word.Vtt word = wordIter.next();

			double start = word.time;
			LineHeader header = new AutoValue_VttTranscript_LineHeader(start, nextStart, template.formatting());
			List<VttToken> tokens = new ArrayList<>(words.size() * 2);

			tokens.add(new VttToken.Word(word.lowercase));
			while (wordIter.hasNext()) {
				word = wordIter.next();
				tokens.add(new VttToken.Time(word.time));
				tokens.add(new VttToken.Word(" " + word.lowercase));
			}
			tokens.add(new VttToken.UnexpectedClose());
			return new AutoValue_VttTranscript_Line(header, tokens);
		}
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

	public static VttTranscript parse(File file, Mode mode) throws IOException {
		return parse(Files.asByteSource(file).asCharSource(StandardCharsets.UTF_8), mode);
	}

	public static VttTranscript parse(CharSource charSource, Mode mode) throws IOException {
		int lineCount = 1;
		try (BufferedReader reader = charSource.openBufferedStream()) {
			StringBuilder headerStr = new StringBuilder();
			String line;
			while (!(line = reader.readLine()).isEmpty()) {
				headerStr.append(line);
				headerStr.append("\n");
				++lineCount;
			}

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
				List<VttToken> tokens;
				if (mode == Mode.STRICT) {
					tokens = VttToken.parseLine(tokenLine);
				} else if (mode == Mode.PERMISSIVE) {
					tokens = parseLineWithTimestamp(tokenLine);
					while (tokens == null) {
						++lineCount;
						line = reader.readLine();
						if (line == null) {
							break;
						}
						tokens = parseLineWithTimestamp(line);
					}
				} else {
					throw Unhandled.enumException(mode);
				}
				if (tokens != null) {
					lines.add(new AutoValue_VttTranscript_Line(header, tokens));
				}

				++lineCount;
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

	@Nullable
	private static List<VttToken> parseLineWithTimestamp(String line) {
		try {
			List<VttToken> tokens = VttToken.parseLine(line);
			for (VttToken token : tokens) {
				if (token.isTime()) {
					return tokens;
				}
			}
			return null;
		} catch (Exception e) {
			return null;
		}
	}

	public String asString() {
		return StringPrinter.buildString(printer -> {
			printer.println(header());
			Iterator<Line> lineIter = lines().iterator();
			while (lineIter.hasNext()) {
				Line line = lineIter.next();
				printer.println(line.header().asString());
				printer.println(VttToken.lineAsString(line.tokens()));
				if (lineIter.hasNext()) {
					printer.println("");
				}
			}
		});
	}

	/** Uses an EditList to map indices from one to the other. */
	private static class IdxMap {
		int[] beginA;
		List<Edit> edits;
		Edit firstEdit, lastEdit;

		IdxMap(List<Edit> edits) {
			this.beginA = edits.stream().mapToInt(edit -> edit.getEndA()).toArray();
			this.edits = edits;
			if (edits.isEmpty()) {
				firstEdit = lastEdit = null;
			} else {
				firstEdit = edits.get(0);
				lastEdit = edits.get(edits.size() - 1);
			}
		}

		public int map(int beforeVal) {
			if (firstEdit == null) {
				return beforeVal;
			} else {
				if (beforeVal <= firstEdit.getBeginA()) {
					return beforeVal;
				} else if (beforeVal >= lastEdit.getEndA()) {
					return beforeVal - lastEdit.getEndA() + lastEdit.getEndB();
				} else {
					int idx = Arrays.binarySearch(beginA, beforeVal);
					if (idx >= 0) {
						return edits.get(idx).getEndB();
					} else {
						int insertionPoint = (-idx) - 1;
						Edit edit = edits.get(insertionPoint);
						if (edit.getEndA() == edit.getBeginA()) {
							// map insertions to their midpoint
							return (edit.getBeginB() + edit.getEndB()) / 2;
						} else {
							// else linear interp
							return edit.getBeginB() + ((edit.getEndB() - edit.getBeginB()) * (beforeVal - edit.getBeginA())) / (edit.getEndA() - edit.getBeginA());
						}
					}
				}
			}
		}
	}

	public VttTranscript save(List<Word.Vtt> newVtt, CharSink charSink) throws IOException {
		List<Line> newLines = new ArrayList<>();

		List<Word.Vtt> oldVtt = words();
		List<Edit> edits = TranscriptMatch.edits(oldVtt, newVtt);

		IdxMap map = new IdxMap(edits);

		int startOld = 0;
		int startNew = 0;
		List<Word.Vtt> buffer = new ArrayList<>();
		VttTranscript.Line lastLine = lines().get(lines().size() - 1);
		for (VttTranscript.Line line : lines()) {
			buffer.clear();
			line.addWords(buffer);

			int endOld = startOld + buffer.size();
			int endNew = map.map(endOld);

			if (startNew == endNew) {
				// we're removing a whole line - no action required, but still need to set startOld/startNew
			} else if (line != lastLine && endNew != newVtt.size()) {
				// the normal line
				newLines.add(Line.create(line.header(), newVtt.subList(startNew, endNew), newVtt.get(endNew).time()));
			} else {
				// the last line
				double endTime = newVtt.get(newVtt.size() - 1).time() + LAST_WORD_DURATION;
				newLines.add(Line.create(line.header(), newVtt.subList(startNew, newVtt.size()), endTime));
				break;
			}
			startOld = endOld;
			startNew = endNew;
		}

		VttTranscript newTranscript = new AutoValue_VttTranscript(header(), newLines);
		charSink.write(newTranscript.asString());
		return newTranscript;
	}

	public static final double LAST_WORD_DURATION = 2.0;

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
