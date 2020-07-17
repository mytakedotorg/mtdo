/*
 * MyTake.org transcript GUI. 
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.foundation.transcript;

import com.diffplug.common.base.Either;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.eclipse.jgit.diff.Edit;
import org.mytake.foundation.transcript.Word.Vtt;

public class SetVttToSaid {
	public static void main(String[] args) throws IOException {
		TranscriptFolder folder = new TranscriptFolder(new File("../presidential-debates"));
		for (String name : folder.transcriptsWithMeta()) {
			TranscriptMatch match = folder.loadTranscript(name);
			if (match.edits().isEmpty()) {
				continue;
			}
			List<Vtt> fixedVtt = new ArrayList<>(match.vttWords());
			int vttDelta = 0;
			for (Edit edit : match.edits()) {
				Either<List<Word.Said>, Integer> said = match.saidFor(edit);
				Either<List<Word.Vtt>, Integer> vtt = match.vttFor(edit);
				if (said.isRight()) {
					List<Word.Vtt> toRemove = vtt.getLeft();
					fixedVtt.removeAll(toRemove);
					vttDelta -= toRemove.size();
				} else {
					List<Word.Said> toAdd = said.getLeft();
					int insertionPoint;
					if (vtt.isRight()) {
						insertionPoint = vtt.getRight() + vttDelta;
						vttDelta += toAdd.size();
					} else {
						List<Word.Vtt> toRemove = vtt.getLeft();
						insertionPoint = fixedVtt.indexOf(toRemove.get(0));
						fixedVtt.removeAll(toRemove);
						vttDelta = vttDelta - toRemove.size() + toAdd.size();
					}
					Word.Vtt before = fixedVtt.get(insertionPoint - 1);
					double dt;
					if (insertionPoint == fixedVtt.size()) {
						dt = 0.5;
					} else {
						Word.Vtt after = fixedVtt.get(insertionPoint);
						double elapsed = after.time() - before.time();
						dt = elapsed / (toAdd.size() + 1);
					}

					for (int i = 0; i < toAdd.size(); ++i) {
						Word.Said a = toAdd.get(i);
						fixedVtt.add(insertionPoint + i, new Word.Vtt(a.lowercase(), before.time + (i + 1) * dt));
					}
				}
			}
			System.out.println("saving " + name);
			match.save(folder, name, fixedVtt, null);
		}
	}
}
