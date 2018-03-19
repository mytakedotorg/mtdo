/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation.transcript;

import com.diffplug.common.collect.ImmutableMap;
import com.google.auto.value.AutoValue;
import java.util.Objects;
import java.util.function.Consumer;

@AutoValue
public abstract class Speaker {
	public abstract String name();

	public abstract boolean isPolitician();

	public static Speaker candidate(String name) {
		return new AutoValue_Speaker(name, true);
	}

	public static Speaker moderator(String name) {
		return new AutoValue_Speaker(name, false);
	}

	private static final ImmutableMap<String, Speaker> speakers;

	static {
		ImmutableMap.Builder<String, Speaker> builder = ImmutableMap.builder();
		Consumer<Speaker> add = speaker -> {
			builder.put(speaker.name(), speaker);
		};
		// unnamed announcer
		add.accept(Speaker.moderator("Announcer"));
		//// 1960
		add.accept(Speaker.candidate("John F Kennedy"));
		add.accept(Speaker.candidate("Richard M Nixon"));
		// 1960-09-26
		add.accept(Speaker.moderator("Howard K Smith"));
		add.accept(Speaker.moderator("Sander Vanocur"));
		add.accept(Speaker.moderator("Charles Warren"));
		add.accept(Speaker.moderator("Bob H Fleming"));
		add.accept(Speaker.moderator("Stuart Novins"));
		speakers = builder.build();
	}

	public static Speaker forName(String name) {
		return Objects.requireNonNull(speakers.get(name), "No such name " + name);
	}
}
