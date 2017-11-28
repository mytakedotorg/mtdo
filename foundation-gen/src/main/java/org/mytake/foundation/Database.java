package org.mytake.foundation;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import com.jsoniter.output.JsonStream;

public class Database {
	List<Videos.VideoFact> videos;
	List<Documents.DocumentFact> excerpts;

	public static void main(String[] args) throws IOException {
		Database database = new Database();
		database.videos = Videos.national().facts;
		database.excerpts = Documents.national().facts;

		Path foundation = Paths.get("../foundation/src/main/resources/foundation");
		try (OutputStream output = new BufferedOutputStream(
				Files.newOutputStream(foundation.resolve("index.js"))
						)) {
			JsonStream.serialize(database, output);
		}

		Path speakermapSrc = Paths.get("src/main/resources/video/speakermap");
		Path speakermapDst = Paths.get("../foundation/src/main/resources/foundation/video/speakermap");
		Files.createDirectories(speakermapDst);
		for (File file : speakermapSrc.toFile().listFiles()) {
			Files.copy(file.toPath(), speakermapDst.resolve(file.getName()), StandardCopyOption.REPLACE_EXISTING);
		}
	}
}
