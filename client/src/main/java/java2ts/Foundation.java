/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package java2ts;

import def.js.ArrayLike;
import java.util.Date;
import java.util.List;
import java2ts.StringTypes.recorded;
import jsweet.util.tuple.Tuple2;

public interface Foundation {
	///////////////////////////////
	// Unused, but what I'd like //
	///////////////////////////////
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
	public class VideoFactContentLegacy extends FactContent {
		public String youtubeId;
		public Number durationSeconds;
		public List<Person> speakers;
		public List<CaptionWord> transcript;
		public List<SpeakerMap> speakerMap;
	}

	@jsweet.lang.Interface
	public class VideoFactContent extends FactContent {
		public String youtubeId;
		public Number durationSeconds;
		public List<Person> speakers;
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
	public class VideoFactContentEncoded extends FactContent {
		public String youtubeId;
		public Number durationSeconds;
		public List<Person> speakers;
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

	//////////////////
	// What we have //
	//////////////////
	@jsweet.lang.Interface
	public class DocumentFact {
		public String title;
		public String filename;
		public Date primaryDate;
		// TODO: https://github.com/cincheo/jsweet/issues/412
		public String primaryDateKind;
	}

	@jsweet.lang.Interface
	public class VideoFact {
		public String id;
		public String title;
		public Date primaryDate;
		public recorded primaryDateKind;
	}

	@jsweet.lang.Interface
	public class Person {
		public String firstname;
		@jsweet.lang.Optional
		public String middlename;
		public String lastname;
	}

	@jsweet.lang.Interface
	public class SpeakerMap {
		public String speaker; // lastname of Person
		public Tuple2<Integer, Integer> range;
	}

	@jsweet.lang.Interface
	public class CaptionWord {
		public int idx;
		public String word;
		public double timestamp;
	}

	@jsweet.lang.Interface
	public class CaptionMeta {
		public List<Person> speakers;
		public List<SpeakerMap> speakerMap;
	}
}
