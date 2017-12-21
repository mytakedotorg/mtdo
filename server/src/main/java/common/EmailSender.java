/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.base.Throwing;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.apache.commons.mail.HtmlEmail;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Registry;
import org.jooby.mail.CommonsEmail;

/**
 * Sends an email in another thread to avoid blocking.
 */
public class EmailSender {
	private Registry registry;
	private Executor executor;

	private EmailSender(Executor executor) {
		this.executor = executor;
	}

	/** Sends an email. If no "from" is specified, it will be from {@link Emails#TEAM}. */
	public void send(Throwing.Consumer<HtmlEmail> sender) throws Throwable {
		HtmlEmail htmlEmail = registry.require(HtmlEmail.class);
		htmlEmail.setFrom(Emails.TEAM, Emails.TEAM_NAME);
		sender.accept(htmlEmail);
		executor.execute(() -> {
			Errors.log().run(htmlEmail::send);
		});
	}

	private static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			Executor executor = Executors.newCachedThreadPool();
			EmailSender emailSender = new EmailSender(executor);
			binder.bind(EmailSender.class).toInstance(emailSender);
			env.onStart(registry -> {
				emailSender.registry = registry;
			});
		}
	}

	public static void init(Jooby jooby) {
		jooby.use(new CommonsEmail());
		jooby.use(new Module());
	}
}
