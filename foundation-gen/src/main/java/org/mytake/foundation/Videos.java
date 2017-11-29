/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package org.mytake.foundation;

import java.util.ArrayList;
import java.util.List;

public class Videos {
	static class VideoFact {
		public String id;
		public String title;
		public String primaryDate;
		public String primaryDateKind;
		public boolean hasCaptions;
	}

	List<VideoFact> facts = new ArrayList<>();

	private VideoFact add(String id, String title, String date) {
		VideoFact fact = new VideoFact();
		fact.id = id;
		fact.title = title;
		fact.primaryDate = date;
		fact.primaryDateKind = "recorded";
		facts.add(fact);
		return fact;
	}

	public static Videos national() {
		Videos videos = new Videos();
		videos.add("Txkwp5AUfCg", "John F. Kennedy - Nixon (1/4)", "1960-09-26");
		videos.add("z-4VeDta7Mo", "John F. Kennedy - Nixon (2/4)", "1960-10-07");
		videos.add("8SdDhojNT2o", "John F. Kennedy - Nixon (3/4)", "1960-10-13");
		videos.add("LN8F1FGZfzA", "John F. Kennedy - Nixon (4/4)", "1960-10-21");
		videos.add("GlPjW_2_LXI", "Jimmy Carter - Gerald Ford (1/3)", "1976-09-23");

		//id: "TjHjU0Eu26Y",  // Original video
		//id: "vIZ6w0kMqUA", // Trimmed for dev work, with captions
		videos.add("GX1kHw2tmtI", "Jimmy Carter - Gerald Ford (2/3)", "1976-10-06").hasCaptions = true;

		videos.add("CipT04S0bVE", "Jimmy Carter - Gerald Ford (3/3)", "1976-10-22");
		videos.add("_8YxFc_1b_0", "Ronald Reagan - Jimmy Carter (1/1)", "1980-10-28");
		videos.add("OGvBFQQPRXs", "Ronald Reagan - Walter Mondale (1/2)", "1984-10-07");
		videos.add("EF73k5-Hiqg", "Ronald Reagan - Walter Mondale (2/2)", "1984-10-21");
		videos.add("PbSzCpUyLPc", "George H.W. Bush - Michael Dukakis (1/2)", "1988-09-25");
		videos.add("OGpROh7Ia10", "George H.W. Bush - Michael Dukakis (2/2)", "1988-10-13");
		videos.add("XD_cXN9O9ds", "Bill Clinton - George H.W. Bush (1/3)", "1992-10-11");
		videos.add("m6sUGKAm2YQ", "Bill Clinton - George H.W. Bush (2/3)", "1992-10-15");
		videos.add("jCGtHqIwKek", "Bill Clinton - George H.W. Bush (3/3)", "1992-10-19");
		videos.add("lZhyS5OtPto", "Bill Clinton - Bob Dole (1/2)", "1996-10-06");
		videos.add("I1fcJjdvLn4", "Bill Clinton - Bob Dole (2/2)", "1996-10-16");
		videos.add("ibcDfgiin2c", "George W. Bush - Al Gore (1/3)", "2000-10-03");
		videos.add("zBXoItXHLTM", "George W. Bush - Al Gore (2/3)", "2000-10-11");
		videos.add("qCIHimWyFb4", "George W. Bush - Al Gore (3/3)", "2000-10-17");
		videos.add("1kW8_Qqff38", "George W. Bush - John Kerry (1/3)", "2004-09-30");
		videos.add("21fXfTmv-aQ", "George W. Bush - John Kerry (2/3)", "2004-10-08");
		videos.add("QcNLfajsA_M", "George W. Bush - John Kerry (3/3)", "2004-10-13");
		videos.add("F-nNIEduEOw", "Barack Obama - John McCain (1/3)", "2008-09-26");
		videos.add("VkBqLBsu-o4", "Barack Obama - John McCain (2/3)", "2008-10-07");
		videos.add("DvdfO0lq4rQ", "Barack Obama - John McCain (3/3)", "2008-10-13");
		videos.add("dkrwUU_YApE", "Barack Obama - Mitt Romney (1/3)", "2012-10-03");
		videos.add("QEpCrcMF5Ps", "Barack Obama - Mitt Romney (2/3)", "2012-10-16");
		videos.add("tecohezcA78", "Barack Obama - Mitt Romney (3/3)", "2012-10-22");
		videos.add("NscjkqaJ8wI", "Donald Trump - Hillary Clinton (1/3)", "2016-09-26");
		//id: "qkk1lrLQl9Q",  // Original video
		//id: "QuPWV36zqdc",  // Trimmed for dev work, with captions
		videos.add("ApTLB76Nmdg", "Donald Trump - Hillary Clinton (2/3)", "2016-10-09").hasCaptions = true;
		videos.add("fT0spjjJOK8", "Donald Trump - Hillary Clinton (3/3)", "2016-10-16");

		return videos;
	}
}
