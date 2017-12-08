package org.mytake.gradle.jsonitercodegen;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;

import org.apache.commons.io.FileUtils;
import org.gradle.api.DefaultTask;
import org.gradle.api.file.FileCollection;
import org.gradle.api.tasks.Classpath;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.TaskAction;

public class JsoniterCodegenTask extends DefaultTask {
	static final String PKG_jsoniter_codegen = "jsoniter_codegen";

	FileCollection classpath;
	String codegenConfigClass;
	File srcDir;

	@Classpath
	public FileCollection getClasspath() {
		return classpath;
	}

	@InputFiles
	public FileCollection getSourceFiles() {
		return getProject().fileTree(srcDir, spec -> {
			spec.exclude(PKG_jsoniter_codegen + "/**");
		});
	}

	@Input
	public String getCodegenConfigClass() {
		return codegenConfigClass;
	}

	/** The output is just the jsoniter_codegen package. */
	@OutputDirectory
	public File getOutputDir() {
		return getProject().file(srcDir + "/" + PKG_jsoniter_codegen);
	}

	@TaskAction
	public void generateCode() throws IOException {
		FileUtils.deleteDirectory(getOutputDir());
		getProject().javaexec(exec -> {
			exec.classpath(classpath);
			exec.setMain("com.jsoniter.static_codegen.StaticCodegen");
			exec.setArgs(Arrays.asList(codegenConfigClass, srcDir));
		});
	}
}
