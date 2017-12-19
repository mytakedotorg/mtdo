/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import static db.Tables.ACCOUNT;
import static db.Tables.MODERATOR;

import com.diffplug.common.base.Throwing;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import java.util.List;
import org.apache.commons.mail.HtmlEmail;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Registry;
import org.jooq.DSLContext;

public class Mods {
	private Registry registry;

	/** Sends an email to all of the moderators.  Don't need to set "to" or "from". */
	public void send(Throwing.Consumer<HtmlEmail> sender) throws Throwable {
		List<String> moderatorEmails;
		try (DSLContext dsl = registry.require(DSLContext.class)) {
			moderatorEmails = dsl.select()
					.from(ACCOUNT.join(MODERATOR)
							.on(ACCOUNT.ID.eq(MODERATOR.ID)))
					.fetch(ACCOUNT.EMAIL);
		}
		registry.require(EmailSender.class).send(htmlEmail -> {
			for (String moderatorEmail : moderatorEmails) {
				htmlEmail.addTo(moderatorEmail);
			}
			sender.accept(htmlEmail);
		});
	}

	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			Mods moderators = new Mods();
			binder.bind(Mods.class).toInstance(moderators);
			env.onStart(registry -> {
				moderators.registry = registry;
			});
		}
	}
}
