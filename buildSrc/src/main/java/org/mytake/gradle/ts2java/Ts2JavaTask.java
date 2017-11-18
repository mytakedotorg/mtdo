package org.mytake.gradle.ts2java;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.gradle.api.DefaultTask;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputDirectory;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.TaskAction;
import org.jsweet.candies.GenerateSourcesTool;

import com.google.common.io.Files;

public class Ts2JavaTask extends DefaultTask {
	@InputDirectory
	File input;

	@OutputDirectory
	File output;

	@Input
	String pkg;

	@TaskAction
	public void convert() throws Throwable {
		GenerateSourcesTool.main(new String[] {
				"--name", this.getName(),
				"--out", output.getAbsolutePath(),
				"--tsFiles", Arrays.stream(input.listFiles())
						.map(File::getAbsolutePath)
						.collect(Collectors.joining(",")),
				"--tsDeps", "",
				"--coreVersion", "NONE"
		});
		String inputName = input.getParentFile().getName() + "/" + input.getName();
		File defSrcName = new File(output, "def/" + inputName);
		File pkgDir = new File(output, pkg);
		pkgDir.mkdirs();
		for (File java : defSrcName.listFiles()) {
			String orig = Files.asCharSource(java, StandardCharsets.UTF_8).read();
			String notAbstract = orig.replace(" abstract ", " ");
			String fixedPackage = notAbstract.replace("def." + inputName.replace('/',  '.'), pkg);
			java.delete();

			File fixed = new File(pkgDir, java.getName());
			Files.asCharSink(fixed, StandardCharsets.UTF_8).write(fixedPackage);
		}
		defSrcName.delete();										// def/src/name
		defSrcName.getParentFile().delete();						// def/src
		defSrcName.getParentFile().getParentFile().delete();		// def
	}
}
