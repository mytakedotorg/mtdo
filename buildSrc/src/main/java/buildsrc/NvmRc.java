package buildsrc;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

public class NvmRc {
	public static String read(File file) throws IOException {
		String str = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8).trim();
		return "v" + str;
	}
}
