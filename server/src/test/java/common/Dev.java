/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
package common;

import com.google.inject.Binder;
import com.google.inject.multibindings.Multibinder;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import com.typesafe.config.Config;
import javax.mail.Address;
import javax.mail.Message.RecipientType;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.MediaType;
import org.jooby.Renderer;

/**
 * The app that we run in unit tests.  See {@link Prod} in the main
 * directory for the app that we run in production.
 */
public class Dev extends DevNoDB {
	public static Dev unitTest() {
		return unitTest(CleanPostgresModule.prePopulatedSchema());
	}

	public static Dev unitTest(CleanPostgresModule db) {
		Dev dev = new Dev(db);
		dev.use(new DevTime.Module());
		return dev;
	}

	public static Dev realtime(CleanPostgresModule postgres) {
		Dev dev = new Dev(postgres);
		Prod.realtime(dev);
		return dev;
	}

	private Dev(CleanPostgresModule postgresModule) {
		use(postgresModule);
		Prod.commonDb(this);
		Prod.controllers(this);
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

	static boolean LOAD_BACKUP = false;

	public static void main(String[] args) {
		Dev dev;
		if (LOAD_BACKUP) {
			dev = Dev.realtime(CleanPostgresModule.loadFromBackup(ProdData.backupFile()));
		} else {
			dev = Dev.realtime(CleanPostgresModule.prePopulatedSchema());
			dev.use(new InitialData.Module());
		}
		Jooby.run(() -> dev, args);
	}
}
