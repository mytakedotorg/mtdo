/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
package org.mytake.lucene.legacyfoundationgen;

import com.diffplug.common.base.Throwing;
import compat.java2ts.VideoFactContentJava;
import java2ts.FT.VideoFactMeta;
import org.mytake.factset.video.TranscriptFolder;
import org.mytake.factset.video.TranscriptMatch;

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
				empty.wordChar = new int[0];
				empty.wordTime = new double[0];
				empty.turnSpeaker = empty.wordChar;
				empty.turnWord = empty.wordChar;
				factContent = empty;
			}
			consumer.accept(factContent);
		}
	}
}
