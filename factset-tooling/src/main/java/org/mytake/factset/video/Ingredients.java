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
import com.diffplug.common.collect.ImmutableSet;
import com.diffplug.common.collect.SetMultimap;
import com.diffplug.common.collect.TreeMultimap;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java2ts.FT;
import org.gradle.api.GradleException;
import org.mytake.factset.DisallowedValueException;
import org.mytake.factset.JsonMisc;
import org.mytake.factset.video.VttTranscript.Mode;

/**
 * A folder of transcript data. `all_people.ini` is a list of every
 * person in every transcript, and `all_roles.ini` is a list of every role.
 * 
 * When loading a video, the first file loaded is `name.json`.  The people
 * and roles in that json file are checked against `all_people.ini` and
 * `all_roles.ini`. Next, `name.said` is loaded, which checks that every
 * person named in the transcript is listed in the json file.
 */
public class Ingredients implements Serializable {
	private static final long serialVersionUID = -3307101650905334494L;

	private final File root;
	private final transient Set<String> people;
	private final transient Set<String> roles;

	public Ingredients(File root) throws IOException {
		this.root = Objects.requireNonNull(root);
		this.people = IniAsSet.parse(filePeople());
		this.roles = IniAsSet.parse(fileRoles());
	}

	public File folder() {
		return root;
	}

	private File filePeople() {
		return new File(root, "all_people.ini");
	}

	private File fileRoles() {
		return new File(root, "all_roles.ini");
	}

	public Set<String> people() {
		return people;
	}

	public Set<String> roles() {
		return roles;
	}

	public static final ImmutableSet<String> VIDEO_EXTENSIONS = ImmutableSet.of("json", "said", "vtt");

	private SetMultimap<String, String> possibleTitles() {
		SetMultimap<String, String> map = TreeMultimap.create();
		for (File file : root.listFiles()) {
			String fileName = file.getName();
			int dot = fileName.lastIndexOf('.');
			if (dot != -1) {
				String name = fileName.substring(0, dot);
				String ext = fileName.substring(dot + 1);
				if (VIDEO_EXTENSIONS.contains(ext)) {
					map.put(name, ext);
				}
			}
		}
		return map;
	}

	/** Has all the files needed for syncing. */
	public List<String> transcripts() {
		SetMultimap<String, String> map = possibleTitles();
		List<String> result = new ArrayList<>(map.size());
		for (Map.Entry<String, Collection<String>> entry : map.asMap().entrySet()) {
			if (entry.getValue().containsAll(VIDEO_EXTENSIONS)) {
				result.add(entry.getKey());
			}
		}
		return result;
	}

	/** Has some of the files needed for syncing, but others are missing. */
	public List<String> incompleteTranscripts() {
		SetMultimap<String, String> map = possibleTitles();
		List<String> result = new ArrayList<>(map.size());
		for (Map.Entry<String, Collection<String>> entry : map.asMap().entrySet()) {
			if (!entry.getValue().containsAll(VIDEO_EXTENSIONS)) {
				result.add(entry.getKey());
			}
		}
		return result;
	}

	/** Returns every transcript that has a meta file. */
	public List<String> transcriptsWithMeta() {
		SetMultimap<String, String> map = possibleTitles();
		List<String> result = new ArrayList<>(map.size());
		for (Map.Entry<String, Collection<String>> entry : map.asMap().entrySet()) {
			if (entry.getValue().contains("json")) {
				result.add(entry.getKey());
			}
		}
		return result;
	}

	/** Loads the given transcript. */
	public TranscriptMatch loadTranscript(String name) throws IOException {
		return loadTranscript(name, new StringPrinter(line -> {}));
	}

	public TranscriptMatch loadTranscript(String name, StringPrinter printer) throws IOException {
		// load and validate the json speakers
		FT.VideoFactMeta meta;
		try {
			printer.print("Loading " + name + ".json  ...  ");
			meta = loadMetaNoValidation(name);
			printer.println("Success.");
			printer.print("Validating speakers  ...  ");
			validateMeta(meta);
			printer.println("Success.");
		} catch (Exception e) {
			throw problemInFile(name + ".json", e);
		}

		// load the said
		SaidTranscript said;
		try {
			printer.print("Loading " + name + ".said  ...  ");
			said = SaidTranscript.parse(fileMeta(name), meta, fileSaid(name));
			printer.println("Success.");
		} catch (Exception e) {
			throw problemInFile(name + ".said", e);
		}

		// load the vtt
		VttTranscript vtt;
		try {
			printer.print("Loading " + name + ".vtt  ...  ");
			vtt = VttTranscript.parse(fileVtt(name), Mode.STRICT);
			printer.println("Success.");
		} catch (Exception e) {
			throw problemInFile(name + ".vtt", e);
		}

		printer.print("Matching  ...  ");
		TranscriptMatch match = new TranscriptMatch(meta, said, vtt);
		printer.println("Success.");
		return match;
	}

	public GradleException problemInFile(String path, Throwable cause) {
		return new GradleException(PROBLEM_IN_START + path + PROBLEM_IN_END + cause.getMessage(), cause);
	}

	public static final String PROBLEM_IN_START = "Problem in '";
	public static final String PROBLEM_IN_END = "': ";
	public static final String VIDEO_MATCH = "video match ";

	public void validateMeta(FT.VideoFactMeta meta) {
		for (FT.Speaker speaker : meta.speakers) {
			if (!people.contains(speaker.fullName)) {
				throw DisallowedValueException.peopleInJson(speaker.fullName, people, filePeople());
			}
			if (!roles.contains(speaker.role)) {
				throw DisallowedValueException.rolesInJson(speaker.role, roles, fileRoles());
			}
		}
	}

	/** Loads transcript metadata without any validation. */
	public FT.VideoFactMeta loadMetaNoValidation(String name) throws IOException {
		return JsonMisc.fromJson(fileMeta(name), FT.VideoFactMeta.class);
	}

	public File fileMeta(String name) {
		return new File(root, name + ".json");
	}

	public File fileSaid(String name) {
		return new File(root, name + ".said");
	}

	public File fileVtt(String name) {
		return new File(root, name + ".vtt");
	}

	/** Given a json/said/vtt/anything, this returns the name appropriate for the methods fileXXX() */
	public String name(Path source) {
		String name = root.toPath().relativize(source).toString();
		int lastDot = name.lastIndexOf('.');
		return lastDot == -1 ? name : name.substring(0, lastDot);
	}

	/** Removes the last ".blah" off of whatever gets passed in. */
	public static String withoutExtension(String path) {
		int idx = path.lastIndexOf('.');
		if (idx == -1) {
			return path;
		}
		return path.substring(0, idx);
	}
}
