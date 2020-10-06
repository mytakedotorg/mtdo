/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
package java2ts;

import def.js.ArrayLike;
import java.util.List;

/** Foundation Types. */
public interface FT {
	public static final String KIND_VIDEO = "video";
	public static final String KIND_DOCUMENT = "document";

	@jsweet.lang.Interface
	public class Fact {
		public String title;
		public String primaryDate; // yyyy-mm-dd
		public String primaryDateKind;
		public String kind;
	}

	@jsweet.lang.Interface
	public class FactsetIndex {
		/** The headline-friendly title. */
		public String title;
		/** The string id (probably repo name) which is used for addressing facts globally. */
		public String id;
		/** The facts in this factset. */
		public List<FactLink> facts;
	}

	@jsweet.lang.Interface
	public class FactLink {
		public Fact fact;
		public String hash;
	}

	@jsweet.lang.Interface
	public class Factset {
		public String id;
		public String title;
	}

	@jsweet.lang.Interface
	public class FactContent {
		public Fact fact;
		public Factset factset;
	}

	@jsweet.lang.Interface
	public class Speaker {
		public String fullName;
		public String role;
	}

	@jsweet.lang.Interface
	public class Location {
		public String placename; // name of the place in the local parlance according to countryCode
		public String cityState; // name of the city in the local parlance according to countryCode
		public String country; // ISO 3166 Alpha-3
	}

	/** Metadata about a video. */
	@jsweet.lang.Interface
	public class VideoFactMeta extends FactContent {
		public String youtubeId;
		public Number durationSeconds;
		public @jsweet.lang.Optional Location location;
		public @jsweet.lang.Optional String notes;
		public List<Speaker> speakers;
	}

	/** Metadata and timed transcript info about a video. */
	@jsweet.lang.Interface
	public class VideoFactContent extends VideoFactMeta {
		public String plainText;
		/** Word n starts at wordChar[n]. */
		public ArrayLike<Number> wordChar;
		/** Word n is spoken at wordTime[n] (in milliseconds). */
		public ArrayLike<Number> wordTime;
		/**
		 * speakers[turnSpeaker[0]] = the first person who speaks.
		 * speakers[turnSpeaker[1]] = the second person who speaks.
		 */
		public ArrayLike<Number> turnSpeaker;
		/**
		 * wordChar[turnWord[0]] = the character offset where the first person starts
		 * wordChar[turnWord[1]] = the character offset where the second person starts
		 */
		public ArrayLike<Number> turnWord;
	}

	@jsweet.lang.Interface
	public class VideoFactContentEncoded extends VideoFactMeta {
		public String plainText;
		/** Count of the words. */
		public int totalWords;
		public int totalTurns;
		/**
		 * [wordChar, wordTime, turnSpeaker, turnWord], little-endian Base64 encoded.
		 */
		public String data;
	}

	@jsweet.lang.Interface
	public class DocumentFactContent extends FactContent {
		public List<DocumentComponent> components;
	}

	@jsweet.lang.Interface
	public class DocumentComponent {
		public String component;
		public String innerHTML;
		public int offset;
	}
}
