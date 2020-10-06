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
package org.mytake.factset.video;


import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.io.CharSource;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java2ts.FT.VideoFactMeta;
import org.mytake.factset.video.SaidTranscript.Turn;

/**
 * Makes sure that:
 * - .said is parsing correctly
 * - no duplicate consecutive speakers
 */
public class SaidCleanup {
	public static String cleanup(Ingredients folder, Path source, String saidString) throws IOException {
		String name = folder.name(source);
		VideoFactMeta meta = folder.loadMetaNoValidation(name);
		SaidTranscript said = SaidTranscript.parse(folder.fileMeta(name), meta, CharSource.wrap(saidString));
		Iterator<Turn> turns = said.turns().iterator();

		Turn last = turns.next();
		List<Turn> clean = new ArrayList<>(said.turns().size());
		while (turns.hasNext()) {
			Turn next = turns.next();
			if (last.speaker().equals(next.speaker())) {
				last = Turn.turnWords(last.speaker(), last.said() + " " + next.said());
			} else {
				clean.add(last);
				last = next;
			}
		}
		clean.add(last);

		return StringPrinter.buildString(SaidTranscript.create(clean)::write);
	}
}
