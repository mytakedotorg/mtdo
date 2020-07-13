package org.mytake.gradle.jsonitercodegen;

import java.io.File;

import org.gradle.api.Plugin;
import org.gradle.api.Project;
import org.gradle.api.plugins.JavaPlugin;
import org.gradle.api.tasks.TaskProvider;
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

		@SuppressWarnings("unchecked")
		TaskProvider<JavaCompile> compileJavaProvider = (TaskProvider<JavaCompile>) (Object) p.getTasks().named(JavaPlugin.COMPILE_JAVA_TASK_NAME);
		TaskProvider<JavaCompile> precompileProvider = p.getTasks().register(JSONITER_PRECOMPILE, JavaCompile.class);
		TaskProvider<JsoniterCodegenTask> codegenProvider = p.getTasks().register(JSONITER_CODEGEN, JsoniterCodegenTask.class, codegen -> {
			JavaCompile compileJava = compileJavaProvider.get();
			JavaCompile precompile = precompileProvider.get();
			codegen.dependsOn(precompile);

			File precompileDir = new File(p.getBuildDir(), "tmp/" + JSONITER_PRECOMPILE);

			codegen.classpath = compileJava.getClasspath().plus(codegen.getProject().files(precompileDir));
			codegen.codegenConfigClass = extension.codegenClass;
			codegen.srcDir = codegen.getProject().file("src/main/java");

			precompile.setSource(codegen.getSourceFiles());
			precompile.setClasspath(compileJava.getClasspath());
			precompile.setDestinationDir(precompileDir);
		});
		compileJavaProvider.configure(task -> task.dependsOn(codegenProvider));
	}
}
