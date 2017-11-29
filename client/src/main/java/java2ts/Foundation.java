/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package java2ts;

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
	public class FactLink {
		public Fact fact;
		public String hash;
	}

	@jsweet.lang.Interface
	public class FactContent {
		public Fact fact;
	}

	@jsweet.lang.Interface
	public class VideoFactContent extends FactContent {
		public String youtubeId;
		@jsweet.lang.Optional
		public List<Person> speakers;
		@jsweet.lang.Optional
		public List<CaptionWord> transcript;
		@jsweet.lang.Optional
		public List<SpeakerMap> speakerMap;
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
