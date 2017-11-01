package org.mytake.gradle.flywayjooq;

import java.io.File;

import javax.sql.DataSource;
import javax.xml.XMLConstants;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.apache.commons.io.FileUtils;
import org.flywaydb.core.Flyway;
import org.gradle.api.DefaultTask;
import org.gradle.api.file.FileCollection;
import org.gradle.api.tasks.Classpath;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputDirectory;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.TaskAction;
import org.jooq.Constants;
import org.jooq.util.GenerationTool;
import org.jooq.util.jaxb.Configuration;
import org.jooq.util.jaxb.Generator;
import org.jooq.util.jaxb.Logging;

import com.opentable.db.postgres.embedded.EmbeddedPostgres;

public class EmbeddedPgTask extends DefaultTask {
	static final String FILESYSTEM_COLON = "filesystem:";

	File flywayMigrations;

	File templateDb;

	Generator generatorConfig;

	FileCollection jooqClasspath;

	@InputDirectory
	public File getFlywayMigrations() {
		return flywayMigrations;
	}

	@OutputDirectory
	public File getTemplateDb() {
		return templateDb;
	}

	@OutputDirectory
	public File getGeneratedSource() {
		return getProject().file(generatorConfig.getTarget().getDirectory());
	}

	@Input
	public Generator getGeneratorConfig() {
		return generatorConfig;
	}

	@InputFiles
	@Classpath
	public FileCollection getJooqClasspath() {
		return jooqClasspath;
	}

	@TaskAction
	public void generate() throws Exception {
		FileUtils.deleteDirectory(templateDb);
		FileUtils.forceMkdir(templateDb);
		EmbeddedPostgres.Builder builder = EmbeddedPostgres.builder()
				.setDataDirectory(templateDb)
				.setCleanDataDirectory(true);
		System.setProperty("ot.epg.no-cleanup", "no"); // cleans on startup, but not shutdown
		try (EmbeddedPostgres postgres = builder.start()) {
			DataSource dataSource = postgres.getTemplateDatabase();
			// migrate the database to its latest version
			Flyway flyway = new Flyway();
			flyway.setDataSource(dataSource);
			flyway.setLocations(FILESYSTEM_COLON + flywayMigrations.getAbsolutePath());
			flyway.setSchemas("public");
			flyway.migrate();

			// configure jooq to run against the db
			Configuration jooqConfig = new Configuration();
			jooqConfig.setGenerator(generatorConfig);
			jooqConfig.setLogging(Logging.TRACE);

			// write the config out to file
			GenerationTool tool = new GenerationTool();
			tool.setDataSource(dataSource);
			tool.run(jooqConfig);
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
