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
package org.mytake.factset.gradle;


import com.diffplug.common.base.Throwing;
import com.diffplug.spotless.Formatter;
import com.diffplug.spotless.FormatterStep;
import com.diffplug.spotless.LineEnding;
import com.diffplug.spotless.PaddedCell;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Map;
import java2ts.FT;
import java2ts.FT.VideoFactContentEncoded;
import org.gradle.api.GradleException;
import org.mytake.factset.GitJson;
import org.mytake.factset.JsonMisc;
import org.mytake.factset.gradle.MtdoFactset.VideoCfg;
import org.mytake.factset.legacy.FactWriter;
import org.mytake.factset.video.SaidTranscript;
import org.mytake.factset.video.TranscriptMatch;
import org.mytake.factset.video.VideoFormat;
import org.mytake.factset.video.VttTranscript;
import org.slf4j.Logger;

class GrindLogic {
	static final String INGREDIENTS = "ingredients";
	static final String SAUSAGE = "sausage";

	Path rootDir;
	VideoCfg video;
	Logger logger;

	GrindLogic(Path rootDir, VideoCfg video, Logger logger) {
		this.rootDir = rootDir;
		this.video = video;
		this.logger = logger;
	}

	void grind(Collection<String> changed, Map<String, String> buildJson) throws IOException {
		try (Formatter formatter = formatterVideoJson(video)) {
			for (String path : changed) {
				File jsonFile = ingredient(path, ".json");
				if (!jsonFile.exists()) {
					continue;
				}
				logger.info("grinding: " + path + ".json");
				// format according to the build.gradle
				PaddedCell.DirtyState cell = PaddedCell.calculateDirtyState(formatter, jsonFile);
				if (cell.didNotConverge()) {
					throw new GradleException("'video { json {' does not converge for " + path);
				} else if (!cell.isClean()) {
					cell.writeCanonicalTo(jsonFile);
				}
				// determine output file, and put it into 'build.json'
				FT.VideoFactMeta json = JsonMisc.fromJson(jsonFile, FT.VideoFactMeta.class);
				String titleSlug = FactWriter.slugify(json.fact.title);
				buildJson.put(path, titleSlug);
				logger.info("  into " + titleSlug + ".json");

				// try to parse
				VideoFactContentEncoded content;
				try {
					FT.VideoFactMeta meta = JsonMisc.fromJson(ingredient(path, ".json"), FT.VideoFactMeta.class);
					SaidTranscript said = SaidTranscript.parse(meta, ingredient(path, ".said"));
					VttTranscript vtt = VttTranscript.parse(ingredient(path, ".vtt"), VttTranscript.Mode.STRICT);
					TranscriptMatch match = new TranscriptMatch(meta, said, vtt);
					content = match.toVideoFact().toEncoded();
				} catch (Exception e) {
					throw new GradleException("Problem in " + path, e);
				}
				logger.info("  success");

				GitJson.write(content).toCompact(rootDir.resolve(SAUSAGE + "/" + titleSlug + ".json").toFile());
			}
		}
	}

	private File ingredient(String path, String ext) {
		return rootDir.resolve(INGREDIENTS + "/" + path + ext).toFile();
	}

	private Formatter formatterVideoJson(VideoCfg video) {
		return formatter(str -> {
			// parse and sort speakers by name
			FT.VideoFactMeta json = JsonMisc.fromJson(str, FT.VideoFactMeta.class);
			json.speakers.sort(Comparator.comparing(speaker -> speaker.fullName));
			// format in-place (fine to reorder speakers if they want)
			video.perVideo.execute(json);
			// pretty-print
			return VideoFormat.prettyPrint(json);
		});
	}

	private Formatter formatter(Throwing.Specific.Function<String, String, IOException> func) {
		FormatterStep step = FormatterStep.createNeverUpToDate("json format", func::apply);
		return Formatter.builder()
				.encoding(StandardCharsets.UTF_8)
				.lineEndingsPolicy(LineEnding.UNIX.createPolicy())
				.steps(Collections.singletonList(step))
				.rootDir(rootDir)
				.build();
	}
}
