/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.foundation;

import com.diffplug.common.io.ByteStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;
import java2ts.Foundation.Fact;
import java2ts.Foundation.Speaker;
import java2ts.Foundation.VideoFactMeta;

/** Format-friendly version of {@link VideoFactMeta#VideoFactMeta}. */
public class VideoJsonFormat {
	public Fact fact;
	public String youtubeId;
	public Number durationSeconds;
	public List<Speaker> speakers;

	public static void main(String[] args) throws IOException {
		byte[] content = ByteStreams.toByteArray(System.in);
		String formatted = format(new String(content, StandardCharsets.UTF_8));
		System.out.write(formatted.getBytes(StandardCharsets.UTF_8));
	}

	static String format(String input) throws IOException {
		VideoJsonFormat meta = JsonMisc.fromJson(input.getBytes(StandardCharsets.UTF_8), VideoJsonFormat.class);
		meta.speakers.sort(Comparator.comparing(speaker -> speaker.fullName));
		String result = JsonMisc.toJson(meta);

		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String formatted = gson.toJson(JsonParser.parseString(result));
		return SPEAKER.matcher(formatted).replaceAll("{\"fullName\": \"$1\", \"role\": \"$2\"}");
	}

	private static final Pattern SPEAKER = Pattern.compile("\\{\\s*\"fullName\": \"(.+)\",\\s+\"role\": \"(.+)\"\\s+\\}");
}
