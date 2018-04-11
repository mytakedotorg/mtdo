/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package org.mytake.foundation;

import com.diffplug.common.base.Throwing;
import compat.java2ts.VideoFactContentJava;
import java2ts.Foundation.VideoFactMeta;
import org.mytake.foundation.transcript.TranscriptFolder;
import org.mytake.foundation.transcript.TranscriptMatch;

public class Videos {
	public static void presidentialDebates(Throwing.Consumer<VideoFactContentJava> consumer) throws Throwable {
		TranscriptFolder folder = new TranscriptFolder(Folders.SRC_PRESIDENTIAL_DEBATES.toFile());
		for (String transcript : folder.transcriptsWithMeta()) {
			VideoFactContentJava factContent;
			try {
				TranscriptMatch match = folder.loadTranscript(transcript);
				factContent = match.toVideoFact();
			} catch (Exception e) {
				VideoFactMeta meta = folder.loadMetaNoValidation(transcript);
				VideoFactContentJava empty = new VideoFactContentJava();
				empty.fact = meta.fact;
				empty.youtubeId = meta.youtubeId;
				empty.durationSeconds = meta.durationSeconds.doubleValue();
				empty.speakers = meta.speakers;

				empty.plainText = "";
				empty.charOffsets = new int[0];
				empty.timestamps = new double[0];
				empty.speakerPerson = empty.charOffsets;
				empty.speakerWord = empty.charOffsets;
				factContent = empty;
			}
			consumer.accept(factContent);
		}
	}
}
