/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
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
package org.mytake.factset;


import com.diffplug.common.base.Preconditions;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java2ts.FT;
import org.eclipse.jgit.util.sha1.SHA1;

public class GitJson {
	public static final String COMMENT_OPEN_STR = "⌊";
	public static final char COMMENT_OPEN = COMMENT_OPEN_STR.charAt(0);
	public static final char COMMENT_CLOSE = '⌋';

	/** Slugifies the given string. */
	public static String slugify(String input) {
		return input.toLowerCase(Locale.US)
				.replace(' ', '-') // replace spaces with hyphens
				.replaceAll("[-]+", "-") // replace multiple hypens with a single hyphen
				.replaceAll("[^\\w-]+", ""); // replace non-alphanumerics and non-hyphens
	}

	/**
	 * Minified json is guaranteed to have no newlines, just a long single-line string.
	 * This makes it terrible to git diff with a standard line-based differ.
	 * To improve that behavior:
	 * - add newlines anywhere, they will be removed
	 * - add ⌊⌋ pairs (mathematic floor) anywhere, they are treated as a comment and removed
	 */
	public static String recondense(String in, StringBuilder buffer) {
		// if you change this, make sure to update FactApi.recondense in server!
		Preconditions.checkArgument(!in.isEmpty());
		Preconditions.checkArgument(in.charAt(0) != '\n');
		Preconditions.checkArgument(in.charAt(0) != COMMENT_OPEN);
		buffer.setLength(0);
		int start = 0;
		int next;
		while ((next = nextParsePaint(in, start)) != 0) {
			if (next > 0) {
				// was '\n'
				buffer.append(in, start, next);
				start = next + 1; // skip the \n
			} else {
				// was ⌊, ignore everything up to the next ⌋
				buffer.append(in, start, -next);
				int close = in.indexOf(COMMENT_CLOSE, -next + 1);
				if (close == -1) {
					return buffer.toString();
				} else {
					start = close + 1;
				}
			}
		}
		if (start < in.length()) {
			buffer.append(in, start, in.length());
		}
		return buffer.toString();
	}

	/**
	 * Makes json git-friendly, by adding newlines which will get removed by {@link #recondense(String)}.
	 */
	private static String gitFriendly(String in, StringBuilder buffer) {
		Matcher matcher = UNESCAPED_QUOTE.matcher(in);
		int lastStart = 0;
		while (matcher.find()) {
			int firstQuote = matcher.end() - 1;
			// we found the first quote, now we find the second one
			Preconditions.checkArgument(matcher.find(), "Quotes are always be paired in well-formed json");
			int afterSecondQuote = matcher.end();
			char sep = in.charAt(afterSecondQuote);
			if (sep == ':') {
				char afterSep = in.charAt(afterSecondQuote + 1);
				if (afterSep != '[' && afterSep != '{') {
					Preconditions.checkArgument(matcher.find(), "Expected value to start with '\"'");
					int valueFirstQuote = matcher.end() - 1;
					Preconditions.checkArgument(matcher.find(), "Expected value to end with '\"'");
					int valueAfterSecondQuote = matcher.end();
					buffer.append(in, lastStart, firstQuote);
					buffer.append('\n');
					String field = in.substring(firstQuote + 1, afterSecondQuote - 1);
					if (field.equals("plainText") || field.equals("data")) {
						String rawValue = in.substring(valueFirstQuote + 1, valueAfterSecondQuote - 1);
						String value;
						if (field.equals("plainText")) {
							value = rawValue.replace(COMMENT_OPEN_STR, "\n" + COMMENT_OPEN_STR)
									.replace(".", ".\n") // put each sentence on its own line
									.replace("?", "?\n")
									.replace("!", "!\n")
									.replaceAll(" (.{1})\\.\n", " $1.") // don't put initials on their own line (e.g. John F. Kennedy)
									.replace("Ms.\n", "Ms.") // don't pust Ms. on its own line
									.replace("Mr.\n", "Mr.") // don't pust Mr. on its own line
									.replace("Mrs.\n", "Mrs.") // don't pust Mrs. on its own line
									.replace("\n \n", " \n");
						} else if (field.equals("data")) {
							value = rawValue
									.replace("/", "/\n") // split at every `111111` for content-based line-brakes
									.replaceAll("(\\S{" + MAX_LINE_LENGTH + "})", "$1\n");
						} else {
							throw new IllegalArgumentException("Unhandled field " + field);
						}
						buffer.append(in, firstQuote, valueFirstQuote + 1);
						buffer.append(value);
						buffer.append(in, valueAfterSecondQuote - 1, valueAfterSecondQuote + 1);
					} else {
						buffer.append(in, firstQuote, valueAfterSecondQuote + 1);
					}
					lastStart = valueAfterSecondQuote + 1;
					continue;
				}
			}
		}
		buffer.append(in, lastStart, in.length());
		return buffer.toString();
	}

	private static final int MAX_LINE_LENGTH = 120;

	private static int nextParsePaint(String in, int startFrom) {
		for (int i = startFrom; i < in.length(); ++i) {
			char c = in.charAt(i);
			if (c == '\n') {
				return i;
			} else if (c == COMMENT_OPEN) {
				return -i;
			}
		}
		return 0; // signifies end of string
	}

	public static String recondense(String in) {
		return recondense(in, new StringBuilder(in.length()));
	}

	private static String gitFriendly(String in) {
		return gitFriendly(in, new StringBuilder(in.length() * 5 / 4));
	}

	public static class Writer {
		private final Object obj;

		Writer(Object obj) {
			this.obj = obj;
		}

		public void toPretty(File file) throws IOException {
			Files.write(file.toPath(), toPrettyString().getBytes(StandardCharsets.UTF_8));
		}

		public void toCompact(File file) throws IOException {
			Files.createDirectories(file.toPath().getParent());
			Files.write(file.toPath(), toCompactString().getBytes(StandardCharsets.UTF_8));
		}

		public String toCompactString() {
			return gitFriendly(toRecondensedForDebugging());
		}

		public String toRecondensedForDebugging() {
			if (obj instanceof FT.VideoFactMeta) {
				return GSON.toJson(reorder(obj, "fact", "factset", "youtubeId", "durationSeconds", "location", "notes", "speakers"));
			} else {
				return GSON.toJson(obj);
			}
		}

		public String toPrettyString() {
			if (obj instanceof FT.VideoFactMeta) {
				return GSON_PRETTY.toJson(reorder(obj, "fact", "factset", "youtubeId", "durationSeconds", "location", "notes", "speakers"));
			} else {
				return GSON_PRETTY.toJson(obj);
			}
		}
	}

	public static JsonObject reorder(Object object, String... topFields) {
		JsonObject orig = GSON.toJsonTree(object).getAsJsonObject();
		JsonObject reordered = new JsonObject();
		for (String field : topFields) {
			reordered.add(field, orig.remove(field));
		}
		for (Map.Entry<String, JsonElement> entry : orig.entrySet()) {
			reordered.add(entry.getKey(), entry.getValue());
		}
		return reordered;
	}

	private static final Gson GSON_PRETTY = new GsonBuilder().disableHtmlEscaping().setPrettyPrinting().create();
	static final Gson GSON = new GsonBuilder().disableHtmlEscaping().create();
	/** https://stackoverflow.com/a/24209736/1153071 */
	private static final Pattern UNESCAPED_QUOTE = Pattern.compile("(?<!\\\\)(?:\\\\{2})*\"");

	public static Writer write(Object obj) {
		return new Writer(obj);
	}

	public static class FieldParser implements AutoCloseable {
		private final JsonReader jsonReader;

		public FieldParser(JsonReader jsonReader) {
			this.jsonReader = jsonReader;
		}

		public <T> T field(String field, Class<T> clazz) throws IOException {
			while (!jsonReader.nextName().equals(field)) {
				jsonReader.skipValue();
			}
			return GSON.fromJson(jsonReader, clazz);
		}

		public <T> T field(String field, TypeToken<T> clazz) throws IOException {
			while (!jsonReader.nextName().equals(field)) {
				jsonReader.skipValue();
			}
			return GSON.fromJson(jsonReader, clazz.getType());
		}

		@Override
		public void close() throws IOException {
			jsonReader.close();
		}
	}

	public static FieldParser parse(byte[] content) throws IOException {
		Reader reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(content), StandardCharsets.UTF_8));
		JsonReader jsonReader = GSON.newJsonReader(reader);
		jsonReader.beginObject();
		return new FieldParser(jsonReader);
	}

	public static String blobSha(byte[] content) throws NoSuchAlgorithmException {
		SHA1 sha = SHA1.newInstance();
		// git blob header
		sha.update("blob ".getBytes(StandardCharsets.UTF_8));
		sha.update(Integer.toString(content.length).getBytes(StandardCharsets.UTF_8));
		sha.update((byte) 0);
		// then the content
		sha.update(content);
		return sha.toObjectId().getName();
	}
}
