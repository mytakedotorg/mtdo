/* 
 * Copyright (C) 2015 Louis Grignon <louis.grignon@gmail.com>
 * Modified 2020 for use by MyTake.org
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.mytake.gradle.jsweet;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.lang3.ArrayUtils;
import org.codehaus.plexus.util.DirectoryScanner;
import org.gradle.api.DefaultTask;
import org.gradle.api.Project;
import org.gradle.api.file.FileCollection;
import org.gradle.api.file.SourceDirectorySet;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Classpath;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.Nested;
import org.gradle.api.tasks.PathSensitive;
import org.gradle.api.tasks.PathSensitivity;
import org.gradle.api.tasks.TaskAction;
import org.jsweet.JSweetConfig;
import org.jsweet.transpiler.JSweetFactory;
import org.jsweet.transpiler.JSweetProblem;
import org.jsweet.transpiler.JSweetTranspiler;
import org.jsweet.transpiler.SourceFile;
import org.jsweet.transpiler.util.ConsoleTranspilationHandler;
import org.jsweet.transpiler.util.ErrorCountTranspilationHandler;
import org.jsweet.transpiler.util.ProcessUtil;
import org.mytake.gradle.node.NodePlugin;

import com.diffplug.gradle.FileMisc;

/**
 * JSweet transpilation task
 * 
 * @author Louis Grignon
 *
 */
@CacheableTask
public class JSweetTranspileTask extends DefaultTask {
	JSweetPluginExtension configuration;
	SourceDirectorySet sources;
	FileCollection classpath;

	@Nested
	public JSweetPluginExtension getConfiguration() {
		return configuration;
	}

	@InputFiles
	@PathSensitive(PathSensitivity.RELATIVE)
	public SourceDirectorySet getSources() {
		return sources;
	}

	@Classpath
	public FileCollection getClasspath() {
		return classpath;
	}

	@TaskAction
	protected void transpile() throws IOException {
		FileMisc.cleanDir(configuration.getTsOut());
		JSweetConfig.initClassPath(System.getProperty("java.home"));

		File tsOutputDir = configuration.getTsOut();
		File jsOutputDir = null;

		File baseDirectory = new File(".").getAbsoluteFile();

		File workingDir = null;

		ErrorCountTranspilationHandler transpilationHandler = new ErrorCountTranspilationHandler(new ConsoleTranspilationHandler());
		try {
			JSweetFactory factory = null;
			if (configuration.getFactoryClassName() != null) {
				try {
					factory = (JSweetFactory) Thread.currentThread().getContextClassLoader()
							.loadClass(configuration.getFactoryClassName()).newInstance();
				} catch (Exception e) {
					try {
						// try forName just in case
						factory = (JSweetFactory) Class.forName(configuration.getFactoryClassName()).newInstance();
					} catch (Exception e2) {
						throw new Exception("cannot find or instantiate factory class: "
								+ configuration.getFactoryClassName()
								+ " (make sure the class is in the plugin's classpath and that it defines an empty public constructor)",
								e2);
					}
				}
			}
			if (factory == null) {
				factory = new JSweetFactory();
			}

			SourceFile[] sourceFiles = collectSourceFiles();

			JSweetTranspiler transpiler = new JSweetTranspiler(baseDirectory, null, factory, workingDir, tsOutputDir,
					jsOutputDir, null, classpath.getAsPath());
			transpiler.setTscWatchMode(false);

			if (configuration.getTargetVersion() != null) {
				transpiler.setEcmaTargetVersion(configuration.getTargetVersion());
			}
			if (configuration.getModule() != null) {
				transpiler.setModuleKind(configuration.getModule());
			}
			if (configuration.isTsOnly() != null) {
				transpiler.setGenerateJsFiles(!configuration.isTsOnly());
			}

			// make sure we use the npm that we intend
			Project root = getProject().getRootProject();
			Project client = root.project("client");
			NodePlugin.Extension node = client.getExtensions().getByType(NodePlugin.Extension.class);
			node.setup.start(client);
			ProcessUtil.addExtraPath(new File(root.getBuildDir(), "node-install/node").getAbsolutePath());
			transpiler.transpile(transpilationHandler, sourceFiles);

			FileMisc.flatten(new File(configuration.getTsOut(), configuration.getTsOut().getName()));
		} catch (NoClassDefFoundError e) {
			transpilationHandler.report(JSweetProblem.JAVA_COMPILER_NOT_FOUND, null, JSweetProblem.JAVA_COMPILER_NOT_FOUND.getMessage());
		} catch (Exception e) {
			throw new RuntimeException(e);
		}

		int errorCount = transpilationHandler.getErrorCount();
		if (errorCount > 0) {
			throw new RuntimeException("transpilation failed with " + errorCount + " error(s) and "
					+ transpilationHandler.getWarningCount() + " warning(s)");
		} else {
			if (transpilationHandler.getWarningCount() > 0) {
				getLogger().info("transpilation completed with " + transpilationHandler.getWarningCount() + " warning(s)");
			} else {
				getLogger().info("transpilation successfully completed with no errors and no warnings");
			}
		}
	}

	private SourceFile[] collectSourceFiles() {
		getLogger().info("source includes: " + ArrayUtils.toString(configuration.getIncludes()));

		Collection<File> sourceDirs = sources.getSrcDirs();

		getLogger().info("sources dirs: " + sourceDirs);

		List<SourceFile> sources = new LinkedList<>();
		for (File sourceDir : sourceDirs) {
			DirectoryScanner dirScanner = new DirectoryScanner();
			dirScanner.setBasedir(sourceDir);
			dirScanner.setIncludes(configuration.getIncludes());
			dirScanner.scan();

			for (String includedPath : dirScanner.getIncludedFiles()) {
				if (includedPath.endsWith(".java")) {
					sources.add(new SourceFile(new File(sourceDir, includedPath)));
				}
			}
		}
		getLogger().info("sourceFiles: " + sources);

		return sources.toArray(new SourceFile[0]);
	}
}
