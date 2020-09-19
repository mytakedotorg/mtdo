/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package org.mytake.fact.transcript;


import com.diffplug.common.base.Either;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.eclipse.jgit.diff.Edit;
import org.mytake.fact.transcript.Word.Vtt;

public class SetVttToSaid {
	public static void main(String[] args) throws IOException {
		TranscriptFolder folder = new TranscriptFolder(new File("../presidential-debates"));
		List<Vtt> newVtt = new ArrayList<>();
		for (String name : folder.transcriptsWithMeta()) {
			// excludes go here
			if (Arrays.asList().contains(name)) {
				continue;
			}
			TranscriptMatch match = folder.loadTranscript(name);
			while (!match.edits().isEmpty()) {
				newVtt.clear();
				newVtt.addAll(match.vttWords());
				Edit edit = match.edits().get(0);
				Either<List<Word.Said>, Integer> said = match.saidFor(edit);
				Either<List<Word.Vtt>, Integer> vtt = match.vttFor(edit);
				if (said.isRight()) {
					List<Word.Vtt> toRemove = vtt.getLeft();
					newVtt.removeAll(toRemove);
				} else {
					List<Word.Said> toAdd = said.getLeft();
					if (vtt.isLeft() && vtt.getLeft().size() == toAdd.size()) {
						List<Word.Vtt> toRemove = vtt.getLeft();
						for (int i = 0; i < toRemove.size(); ++i) {
							newVtt.set(edit.getBeginB() + i, new Word.Vtt(toAdd.get(i).lowercase(), toRemove.get(i).time()));
						}
					} else {
						int insertionPoint;
						if (vtt.isRight()) {
							insertionPoint = vtt.getRight();
						} else {
							List<Word.Vtt> toRemove = vtt.getLeft();
							insertionPoint = newVtt.indexOf(toRemove.get(0));
							if (toRemove.size() == toAdd.size()) {
								insertionPoint = -1;
							}
						}
						System.out.println(name);
						Word.Vtt before = newVtt.get(insertionPoint - 1);
						double dt;
						if (insertionPoint == newVtt.size()) {
							dt = 0.5;
						} else {
							Word.Vtt after = newVtt.get(insertionPoint);
							double elapsed = after.time() - before.time();
							dt = elapsed / (toAdd.size() + 1);
						}

						for (int i = 0; i < toAdd.size(); ++i) {
							Word.Said a = toAdd.get(i);
							newVtt.add(insertionPoint + i, new Word.Vtt(a.lowercase(), before.time + (i + 1) * dt));
						}
					}
				}
				System.out.println("saving " + name + " with edits " + match.edits().size());
				match = match.save(folder, name, newVtt, null);
			}
		}
	}
}
