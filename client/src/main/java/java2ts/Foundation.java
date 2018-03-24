/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

import def.js.ArrayLike;
import java.util.List;

public interface Foundation {
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
	public class IndexPointer {
		public String hash;
	}

	@jsweet.lang.Interface
	public class FactLink {
		public Fact fact;
		public String hash;
	}

	@jsweet.lang.Interface
	public class FactContent {
		public Fact fact;
	}

	@jsweet.lang.Interface
	public class Speaker {
		public String name;
		public String role;
	}

	/** Metadata about a video. */
	@jsweet.lang.Interface
	public class VideoFactMeta extends FactContent {
		public String youtubeId;
		public Number durationSeconds;
		public List<Speaker> speakers;
	}

	/** Metadata and timed transcript info about a video. */
	@jsweet.lang.Interface
	public class VideoFactContent extends VideoFactMeta {
		public String plainText;
		/** Word n starts at charOffsets[n]. */
		public ArrayLike<Number> charOffsets;
		/** Word n is spoken at timestamps[n]. */
		public ArrayLike<Number> timestamps;
		/**
		 * speakers[speakerPerson[0]] = the first person who speaks.
		 * speakers[speakerPerson[1]] = the second person who speaks.
		 */
		public ArrayLike<Number> speakerPerson;
		/**
		 * charOffsets[speakerWord[0]] = the character offset where the first person starts
		 * charOffsets[charOffsets[1]] = the character offset where the second person starts
		 */
		public ArrayLike<Number> speakerWord;
	}

	@jsweet.lang.Interface
	public class VideoFactContentEncoded extends VideoFactMeta {
		public String plainText;
		/** Count of the words. */
		public int numWords;
		public int numSpeakerSections;
		/**
		 * [charOffsets, timestamps, speakerPerson, speakerWord], little-endian Base64 encoded.
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
