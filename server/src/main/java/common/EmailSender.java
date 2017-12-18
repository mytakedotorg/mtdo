/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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
import org.jooby.Request;
import org.jooby.mail.CommonsEmail;

/**
 * Sends an email in another thread to avoid blocking.
 */
public class EmailSender {
	private final Executor executor;

	private EmailSender(Executor executor) {
		this.executor = executor;
	}

	public void send(Request req, Throwing.Consumer<HtmlEmail> sender) throws Throwable {
		HtmlEmail htmlEmail = req.require(HtmlEmail.class);
		sender.accept(htmlEmail);
		executor.execute(() -> {
			Errors.log().run(htmlEmail::send);
		});
	}

	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			Executor executor = Executors.newCachedThreadPool();
			binder.bind(EmailSender.class).toInstance(new EmailSender(executor));
		}
	}

	public static void init(Jooby jooby) {
		jooby.use(new CommonsEmail());
		jooby.use(new Module());
	}
}
