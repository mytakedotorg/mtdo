/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.io.Files;
import com.google.inject.Binder;
import com.google.inject.multibindings.Multibinder;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import com.palantir.docker.compose.DockerComposeRule;
import com.palantir.docker.compose.configuration.ProjectName;
import com.palantir.docker.compose.execution.DockerComposeExecArgument;
import com.palantir.docker.compose.execution.DockerComposeExecOption;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.io.File;
import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import javax.mail.Address;
import javax.mail.Message.RecipientType;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.MediaType;
import org.jooby.Renderer;
import org.jooby.whoops.Whoops;

/**
 * The app that we run in unit tests.  See {@link Prod} in the main
 * directory for the app that we run in production.
 */
public class Dev extends Jooby {
	{
		// random and time-dependent results in tests will be repeatable
		use((env, conf, binder) -> {
			binder.bind(Random.class).toInstance(new Random(0));
		});
		use(new DevTime.Module());
		use(new GreenMailModule());
		use(new EmbeddedPostgresModule());
		// exit has to come before the "/user" route
		get("/exit", (req, rsp) -> {
			stop();
		});
		Prod.common(this);
		Prod.controllers(this);
		use(new JooqDebugRenderer());
		use(new Whoops());
	}

	static class JooqDebugRenderer implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			Multibinder.newSetBinder(binder, Renderer.class)
					.addBinding()
					.toInstance(new Renderer() {
						@Override
						public void render(Object value, Context ctx) throws Exception {
							if (value instanceof org.jooq.Result) {
								ctx.type(MediaType.html)
										.send("<!DOCTYPE html><html><body><div style=\"font-family:monospace\">" +
												value.toString().replace("\n", "<br>").replace(" ", "&nbsp;") +
												"</div></body></html>");
							}
						}
					});
		}
	}

	static class EmbeddedPostgresModule implements Jooby.Module {
		private static final String USER = "postgres";

		private final String randomDbName;

		{
			// create a random database name
			randomDbName = Integer.toString(Math.abs((int) (Math.random() * 1e9)));
			// create the database
			dockerPostgresExec("createdb", "-U", USER, randomDbName);
		}

		void dockerPostgresExec(String... args) {
			File dockerComposeFile = new File("src/test/resources/docker-compose.yml");
			DockerComposeRule rule = DockerComposeRule.builder()
					.file(dockerComposeFile.getAbsolutePath())
					.projectName(ProjectName.fromString(Integer.toString(Math.abs(dockerComposeFile.getAbsolutePath().hashCode()))))
					.build();
			Errors.rethrow().run(() -> {
				rule.dockerCompose().exec(DockerComposeExecOption.noOptions(), USER, DockerComposeExecArgument.arguments(args));
			});
		}

		private void delete() {
			dockerPostgresExec("dropdb", "-U", USER, randomDbName);
		}

		@Override
		public Config config() {
			// connect to it
			String jdbcUrl;
			{
				Properties connectionProps = new Properties();
				File connectionFile = new File("build/pgConnection.properties");
				try (Reader reader = Files.asCharSource(connectionFile, StandardCharsets.UTF_8).openBufferedStream()) {
					connectionProps.load(reader);
				} catch (IOException e) {
					throw Errors.asRuntime(e);
				}
				String ip = connectionProps.getProperty("host");
				int port = Integer.parseInt(connectionProps.getProperty("port"));
				jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", ip, port, randomDbName);
			}

			Map<String, String> map = new HashMap<>();
			map.put("db.url", jdbcUrl);
			map.put("db.user", USER);
			map.put("db.password", "");
			return ConfigFactory.parseMap(map);
		}

		@Override
		public void configure(Env env, Config conf, Binder binder) {
			env.onStarted(() -> {
				env.onStop(this::delete);
			});
		}
	}

	static class GreenMailModule implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			ServerSetup setup = new ServerSetup(conf.getInt("mail.smtpPort"), conf.getString("mail.hostName"), "smtp");
			GreenMail greenMail = new GreenMail(setup);
			greenMail.start();
			env.onStop(greenMail::stop);
			binder.bind(GreenMail.class).toInstance(greenMail);

			env.router().get("/email", req -> {
				StringBuilder builder = new StringBuilder();
				builder.append("<ul>");
				MimeMessage[] messages = greenMail.getReceivedMessages();
				for (int i = 0; i < messages.length; ++i) {
					String index = Integer.toString(i + 1);
					builder.append("<li><a href=\"/email/" + index + "\">");
					builder.append(index + " &lt;");
					MimeMessage message = messages[i];
					for (Address addr : message.getRecipients(RecipientType.TO)) {
						builder.append(addr.toString());
					}
					builder.append("&gt; " + message.getSubject());
					builder.append("</a></li>");
				}
				builder.append("</ul>");
				return builder.toString();
			});
			env.router().get("/email/:idx", req -> {
				int idx = req.param("idx").intValue() - 1;
				MimeMessage[] messages = greenMail.getReceivedMessages();
				if (idx >= 0 && idx < messages.length) {
					MimeMessage message = messages[idx];
					MimeMultipart content = (MimeMultipart) message.getContent();
					StringBuilder buffer = new StringBuilder();
					for (int i = 0; i < content.getCount(); ++i) {
						buffer.append(content.getBodyPart(i).getContent().toString());
					}
					return buffer.toString();
				} else {
					return "No such message";
				}
			});
		}
	}

	public static void main(String[] args) {
		Jooby.run(DevWithInitialData.class, args);
	}

	public static class DevWithInitialData extends Dev {
		{
			use(new InitialData.Module());
		}
	}
}
