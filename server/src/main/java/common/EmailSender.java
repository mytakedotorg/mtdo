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
	public void send(Throwing.Consumer<HtmlEmail> sender) {
		try {
			HtmlEmail htmlEmail = registry.require(HtmlEmail.class);
			htmlEmail.setFrom(Emails.TEAM.email(), Emails.TEAM.name());
			sender.accept(htmlEmail);
			executor.execute(() -> {
				Errors.log().run(htmlEmail::send);
			});
		} catch (Throwable e) {
			throw Errors.asRuntime(e);
		}
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
