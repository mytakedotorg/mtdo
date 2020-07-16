/*
 * MyTake.org transcript GUI.
 * Copyright (C) 2018 MyTake.org, Inc.
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
