package org.mytake.gradle.flywayjooq;

import java.io.File;

import javax.xml.XMLConstants;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.gradle.api.DefaultTask;
import org.gradle.api.tasks.CacheableTask;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.Internal;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.TaskAction;
import org.jooq.Constants;
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

	static void writeConfig(Configuration jooqConfig, File configFile) throws Exception {
		SchemaFactory sf = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
		Schema schema = sf.newSchema(GenerationTool.class.getResource("/xsd/" + Constants.XSD_CODEGEN));

		JAXBContext ctx = JAXBContext.newInstance(Configuration.class);
		Marshaller marshaller = ctx.createMarshaller();
		marshaller.setSchema(schema);

		configFile.getParentFile().mkdirs();
		marshaller.marshal(jooqConfig, configFile);
	}
}

