package org.mytake.gradle.flywayjooq;

import java.io.File;

import org.gradle.api.DefaultTask;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.TaskAction;
import org.jooq.codegen.GenerationTool;
import org.jooq.meta.jaxb.Configuration;
import org.jooq.meta.jaxb.Generator;
import org.jooq.meta.jaxb.Logging;

import com.diffplug.common.base.Preconditions;

@CacheableTask
public class JooqTask extends DefaultTask {
	static final String FILESYSTEM_COLON = "filesystem:";

	SetupCleanupDockerFlyway setup;
	Generator generatorConfig;

	@Internal
	public SetupCleanupDockerFlyway getSetup() {
		return setup;
	}

	@OutputDirectory
	public File getGeneratedSource() {
		return getProject().file(generatorConfig.getTarget().getDirectory());
	}

	@OutputFile
	public File getSchema() {
		return setup.flywaySchemaDump;
	}

	@Input
	public Generator getGeneratorConfig() {
		return generatorConfig;
	}

	@TaskAction
	public void generate() throws Exception {
		String targetDir = generatorConfig.getTarget().getDirectory();
		Preconditions.checkArgument(!(new File(targetDir).isAbsolute()), "`generator.target.directory` must not be absolute, was `%s`", targetDir);
		// configure jooq to run against the db
		try {
			generatorConfig.getTarget().setDirectory(getGeneratedSource().getAbsolutePath());
			Configuration jooqConfig = new Configuration();
			jooqConfig.setGenerator(generatorConfig);
			jooqConfig.setLogging(Logging.TRACE);

			// write the config out to file
			GenerationTool tool = new GenerationTool();
			tool.setDataSource(setup.getConnection());
			tool.run(jooqConfig);
		} finally {
			generatorConfig.getTarget().setDirectory(targetDir);
		}
	}
}

