package org.mytake.gradle.flywayjooq;

import java.io.File;
import java.nio.charset.StandardCharsets;

import javax.xml.XMLConstants;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.flywaydb.core.Flyway;
import org.gradle.api.DefaultTask;
import org.gradle.api.file.FileCollection;
import org.gradle.api.tasks.Classpath;
import org.gradle.api.tasks.Input;
import org.gradle.api.tasks.InputDirectory;
import org.gradle.api.tasks.InputFile;
import org.gradle.api.tasks.InputFiles;
import org.gradle.api.tasks.OutputDirectory;
import org.gradle.api.tasks.OutputFile;
import org.gradle.api.tasks.TaskAction;
import org.jooq.Constants;
import org.jooq.util.GenerationTool;
import org.jooq.util.jaxb.Configuration;
import org.jooq.util.jaxb.Generator;
import org.jooq.util.jaxb.Logging;
import org.postgresql.ds.PGSimpleDataSource;

import com.google.common.io.Files;
import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.connection.DockerPort;
import com.palantir.docker.compose.execution.DockerComposeExecArgument;
import com.palantir.docker.compose.execution.DockerComposeExecOption;

public class EmbeddedPgTask extends DefaultTask {
	static final String FILESYSTEM_COLON = "filesystem:";

	File dockerComposeFile;

	File flywayMigrations;

	File connectionParams;

	File schemaDump;

	Generator generatorConfig;

	FileCollection jooqClasspath;

	@InputDirectory
	public File getFlywayMigrations() {
		return flywayMigrations;
	}

	@InputFile
	public File getDockerComposeFile() {
		return dockerComposeFile;
	}

	@OutputFile
	public File getConnectionParams() {
		return connectionParams;
	}

	@OutputFile
	public File getSchemaDump() {
		return schemaDump;
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
		if (connectionParams.exists()) {
			connectionParams.delete();
			DockerPg.createRule(dockerComposeFile).dockerCompose().down();
		}

		DockerComposeRule rule = DockerPg.createRule(dockerComposeFile);
		rule.before();
		DockerPort port = DockerPg.postgresPort(rule);

		// write out the connectionParams file
		Files.createParentDirs(connectionParams);
		Files.write("host=" + port.getIp() + "\nport=" + port.getExternalPort(), connectionParams, StandardCharsets.UTF_8);

		// create the postgres datasource
		PGSimpleDataSource dataSource = new PGSimpleDataSource();
		dataSource.setServerName(port.getIp());
		dataSource.setPortNumber(port.getExternalPort());
		dataSource.setUser("postgres");
		dataSource.setDatabaseName("template1");

		// migrate the schemas
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

		// write out the schema to disk
		String schema = rule.dockerCompose().exec(DockerComposeExecOption.noOptions(),
				"postgres", DockerComposeExecArgument.arguments(
						"pg_dump", "-d", "template1", "-U", "postgres", "--schema-only"));
		Files.createParentDirs(schemaDump);
		Files.write(schema, schemaDump, StandardCharsets.UTF_8);
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
