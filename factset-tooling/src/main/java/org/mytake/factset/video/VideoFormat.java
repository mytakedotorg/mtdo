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
package org.mytake.factset.video;


import com.diffplug.common.base.Preconditions;
import com.diffplug.common.io.ByteStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java2ts.FT;
import java2ts.FT.VideoFactMeta;
import org.mytake.factset.JsonMisc;

/** Format-friendly version of {@link VideoFactMeta}. */
public class VideoFormat {
	private VideoFormat() {}

	public static void main(String[] args) throws IOException {
		byte[] content = ByteStreams.toByteArray(System.in);
		String formatted = format(new String(content, StandardCharsets.UTF_8));
		System.out.write(formatted.getBytes(StandardCharsets.UTF_8));
	}

	private static String format(String input) throws IOException {
		FT.VideoFactMeta meta = JsonMisc.fromJson(input, FT.VideoFactMeta.class);

		if (meta.fact.title.startsWith("Presidential Debate - ")) {
			String lastNames = meta.speakers.stream()
					.filter(speaker -> speaker.role.contains("for President"))
					.map(speaker -> {
						int lastSpace = speaker.fullName.lastIndexOf(' ');
						return speaker.fullName.substring(lastSpace + 1);
					})
					.sorted().collect(Collectors.joining(", "));
			Matcher matcher = Pattern.compile("\\((\\d) of (\\d)\\)").matcher(meta.fact.title);
			Preconditions.checkArgument(matcher.find());
			meta.fact.title = "Presidential Debate - " + lastNames + " (" + matcher.group(1) + " of " + matcher.group(2) + ")";
		} else {
			throw new Error("Unhandled title.");
		}

		meta.speakers.sort(Comparator.comparing(speaker -> speaker.fullName));
		return prettyPrint(meta);
	}

	public static String prettyPrint(FT.VideoFactMeta meta) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		JsonObject tree = gson.toJsonTree(meta).getAsJsonObject();
		JsonObject reordered = new JsonObject();
		reordered.add("fact", tree.remove("fact"));
		for (Map.Entry<String, JsonElement> entry : tree.entrySet()) {
			reordered.add(entry.getKey(), entry.getValue());
		}
		String formatted = gson.toJson(reordered);
		return SPEAKER.matcher(formatted).replaceAll("{\"fullName\": \"$1\", \"role\": \"$2\"}");
	}

	private static final Pattern SPEAKER = Pattern.compile("\\{\\s*\"fullName\": \"(.+)\",\\s+\"role\": \"(.+)\"\\s+\\}");
}
