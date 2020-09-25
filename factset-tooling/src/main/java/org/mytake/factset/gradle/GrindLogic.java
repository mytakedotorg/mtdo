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


import com.diffplug.common.base.Errors;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Throwing;
import com.diffplug.common.collect.Sets;
import com.diffplug.spotless.Formatter;
import com.diffplug.spotless.FormatterStep;
import com.diffplug.spotless.LineEnding;
import com.diffplug.spotless.PaddedCell;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java2ts.FT;
import java2ts.FT.FactLink;
import org.gradle.api.GradleException;
import org.mytake.factset.GitJson;
import org.mytake.factset.JsonMisc;
import org.mytake.factset.gradle.MtdoFactset.VideoCfg;
import org.mytake.factset.video.SaidTranscript;
import org.mytake.factset.video.SetIni;
import org.mytake.factset.video.TranscriptMatch;
import org.mytake.factset.video.VideoFactContentJava;
import org.mytake.factset.video.VideoFormat;
import org.mytake.factset.video.VttTranscript;
import org.slf4j.Logger;

public class GrindLogic {
	static final String INGREDIENTS = "ingredients";
	static final String SAUSAGE = "sausage";

	Path rootDir;
	VideoCfg video;
	Logger logger;

	public GrindLogic(Path rootDir, VideoCfg video, Logger logger) {
		this.rootDir = rootDir;
		this.video = video;
		this.logger = logger;
	}

	public void grind(Collection<String> changed, Map<String, String> buildJson) throws IOException {
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
				String titleSlug = GitJson.slugify(json.fact.title);
				buildJson.put(path, titleSlug);
				logger.info("  into " + titleSlug + ".json");

				// try to parse
				FT.VideoFactContentEncoded content;
				try {
					FT.VideoFactMeta meta = JsonMisc.fromJson(ingredient(path, ".json"), FT.VideoFactMeta.class);
					SaidTranscript said = SaidTranscript.parse(meta, ingredient(path, ".said"));
					VttTranscript vtt = VttTranscript.parse(ingredient(path, ".vtt"), VttTranscript.Mode.STRICT);
					TranscriptMatch match = new TranscriptMatch(meta, said, vtt);
					content = encodeSpeakersIntoComments(match.toVideoFact());
				} catch (Exception e) {
					throw new GradleException("Problem in " + path, e);
				}
				logger.info("  success");

				GitJson.write(content).toCompact(rootDir.resolve(SAUSAGE + "/" + titleSlug + ".json").toFile());
			}
		}
	}

	public Validator validator() throws IOException {
		return new Validator();
	}

	public class Validator {
		final Set<String> roles, people;
		final Set<String> foundRoles = new HashSet<>();
		final Set<String> foundPeople = new HashSet<>();

		Validator() throws IOException {
			roles = SetIni.parse(ingredient("all_roles", ".ini"));
			people = SetIni.parse(ingredient("all_people", ".ini"));
		}

		public List<String> warningsFor(String path) throws IOException {
			List<String> warnings = new ArrayList<>();
			FT.VideoFactMeta meta = JsonMisc.fromJson(ingredient(path, ".json"), FT.VideoFactMeta.class);
			for (FT.Speaker speaker : meta.speakers) {
				foundRoles.add(speaker.role);
				foundPeople.add(speaker.fullName);
				if (!roles.contains(speaker.role)) {
					warnings.add("No such role '" + speaker.role + "' for '" + speaker.fullName + "' in all_roles.ini");
				}
				if (!people.contains(speaker.fullName)) {
					warnings.add("No such person '" + speaker.fullName + "' in all_people.ini");
				}
			}
			return warnings;
		}

		/** Returns an empty string if all_people.ini and all_roles.ini were complete, or something else if they weren't. */
		public String allFound() {
			return StringPrinter.buildString(printer -> {
				for (String unusedRole : Sets.difference(roles, foundRoles)) {
					printer.println(INGREDIENTS + "/all_roles.ini: unused role '" + unusedRole + "'");
				}
				for (String unusedPerson : Sets.difference(people, foundPeople)) {
					printer.println(INGREDIENTS + "/all_people.ini: unused person '" + unusedPerson + "'");
				}
			});
		}
	}

	public List<FactLink> buildIndex(Path sausageDir) throws IOException {
		List<FactLink> factLinks = new ArrayList<>();
		Files.walkFileTree(sausageDir, new SimpleFileVisitor<Path>() {
			@Override
			public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
				String name = file.toFile().getName();
				if (name.equals("build.json") || name.equals("index.json")) {
					return FileVisitResult.CONTINUE;
				}
				byte[] content = Files.readAllBytes(file);

				FactLink link = new FactLink();
				try (GitJson.FieldParser parser = GitJson.parse(content)) {
					link.fact = parser.field("fact", FT.Fact.class);
					link.hash = GitJson.sha1base16(content);
				} catch (NoSuchAlgorithmException e) {
					throw Errors.asRuntime(e);
				}
				factLinks.add(link);
				return FileVisitResult.CONTINUE;
			}
		});
		Comparator<FactLink> linkComparator = Comparator.comparing(factLink -> factLink.fact.primaryDate);
		Collections.sort(factLinks, linkComparator.thenComparing(factLink -> factLink.fact.title));
		return factLinks;
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

	static FT.VideoFactContentEncoded encodeSpeakersIntoComments(VideoFactContentJava content) {
		StringBuilder builder = new StringBuilder(content.plainText.length() * 3 / 2);
		List<String> lastNames = content.speakers.stream().map(speaker -> {
			int lastSpace = speaker.fullName.lastIndexOf(' ');
			String lastName = speaker.fullName.substring(lastSpace + 1);
			return GitJson.COMMENT_OPEN + lastName + GitJson.COMMENT_CLOSE;
		}).collect(Collectors.toList());
		int turnStart = 0;
		for (int t = 0; t < content.turnSpeaker.length; ++t) {
			int turnEnd;
			if (t == content.turnSpeaker.length - 1) {
				turnEnd = content.plainText.length();
			} else {
				turnEnd = content.wordChar[content.turnWord[t + 1]];
			}
			builder.append(lastNames.get(content.turnSpeaker[t]));
			builder.append(content.plainText, turnStart, turnEnd);
			turnStart = turnEnd;
		}
		FT.VideoFactContentEncoded encoded = content.toEncoded();
		encoded.plainText = builder.toString();
		return encoded;
	}
}