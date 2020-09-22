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
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or combining it
 * with Eclipse SWT (or a modified version of that library), containing parts
 * covered by the terms of the Eclipse Public License, the licensors of this Program
 * grant you additional permission to convey the resulting work.
 * {Corresponding Source for a non-source form of such a combination shall include the
 * source code for the parts of Eclipse SWT used as well as that of the covered work.}
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.factset.legacy;


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
