package org.mytake.gradle.hash;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.TreeMap;

import org.eclipse.jgit.util.sha1.SHA1;
import org.gradle.api.DefaultTask;
import org.gradle.api.file.FileCollection;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.OutputFiles;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;

public class HashTask extends DefaultTask {
	private List<File> folders = new ArrayList<>();
	private List<String> strings = new ArrayList<>();
	private FileCollection destinations;

	public void addFolder(Object folderObj) {
		File folder = getProject().file(folderObj);
		getInputs().dir(folder).withPathSensitivity(PathSensitivity.RELATIVE);
		folders.add(folder);
	}

	public void addStrings(String... strings) {
		addStrings(Arrays.asList(strings));
	}

	public void addStrings(Iterable<String> strings) {
		for (String string : strings) {
			this.strings.add(string);
		}
	}

	public void destination(Object... destinations) {
		this.destinations = getProject().files(destinations);
	}

	@Input
	public List<String> getStrings() {
		return strings;
	}

	@OutputFiles
	public FileCollection getDestination() {
		return destinations;
	}

	@TaskAction
	public void action() throws IOException {
		SHA1 buffer = SHA1.newInstance();
		for (File folder : folders) {
			buffer.update(hashTree(folder.toPath()));
		}
		for (String string : strings) {
			buffer.update(string.getBytes(StandardCharsets.UTF_8));
		}
		byte[] content = ("{\"hash\":\"" + buffer.toObjectId().name() + "\"}").getBytes(StandardCharsets.UTF_8);
		for (File file : destinations) {
			Files.createDirectories(file.toPath().getParent());
			Files.write(file.toPath(), content);
		}
	}

	/** Hashes the given folder. */
	private static byte[] hashTree(Path rootFolder) throws IOException {
		TreeMap<String, byte[]> tree = new TreeMap<>();
		Files.walkFileTree(rootFolder, new SimpleFileVisitor<Path>() {
			@Override
			public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
				String path = rootFolder.relativize(file).toString();
				byte[] content = Files.readAllBytes(file);
				tree.put(path, hashBlob(content));
				return FileVisitResult.CONTINUE;
			}
		});
		SHA1 buffer = SHA1.newInstance();
		tree.forEach((path, sha) -> {
			buffer.update(path.getBytes(StandardCharsets.UTF_8));
			buffer.update((byte) 0);
			buffer.update(sha);
		});
		return buffer.digest();
	}

	private static byte[] hashBlob(byte[] content) {
		SHA1 sha = SHA1.newInstance();
		// git blob header
		sha.update("blob ".getBytes(StandardCharsets.UTF_8));
		sha.update(Integer.toString(content.length).getBytes(StandardCharsets.UTF_8));
		sha.update((byte) 0);
		// then the content
		sha.update(content);
		return sha.digest();
	}
}
