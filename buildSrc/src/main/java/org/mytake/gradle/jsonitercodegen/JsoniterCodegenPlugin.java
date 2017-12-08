package org.mytake.gradle.jsonitercodegen;

import java.io.File;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.plugins.JavaPlugin;
import org.gradle.api.tasks.compile.JavaCompile;

public class JsoniterCodegenPlugin implements Plugin<Project> {
	public static class Extension {
		public String codegenClass;
	}

	private static final String JSONITER_CODEGEN = "jsoniterCodegen";
	private static final String JSONITER_PRECOMPILE = "jsoniterPrecompile";

	@Override
	public void apply(Project p) {
		Extension extension = p.getExtensions().create(JSONITER_CODEGEN, Extension.class);

		JavaCompile compileJava = (JavaCompile) p.getTasks().getByName(JavaPlugin.COMPILE_JAVA_TASK_NAME);
		JsoniterCodegenTask codegen = p.getTasks().create(JSONITER_CODEGEN, JsoniterCodegenTask.class);
		JavaCompile precompile = p.getTasks().create(JSONITER_PRECOMPILE, JavaCompile.class);

		compileJava.dependsOn(codegen);
		codegen.dependsOn(precompile);

		File precompileDir = new File(p.getBuildDir(), "tmp/" + JSONITER_PRECOMPILE);

		p.afterEvaluate(project -> {
			codegen.classpath = compileJava.getClasspath().plus(project.files(precompileDir));
			codegen.codegenConfigClass = extension.codegenClass;
			codegen.srcDir = project.file("src/main/java");

			precompile.setSource(codegen.getSourceFiles());
			precompile.setClasspath(compileJava.getClasspath());
			precompile.setDestinationDir(precompileDir);
		});
	}
}
