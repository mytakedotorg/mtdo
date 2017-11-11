/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.fizzed.rocker.runtime.RockerRuntime;
import com.google.inject.Binder;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import com.opentable.db.postgres.embedded.DatabasePreparer;
import com.opentable.db.postgres.embedded.EmbeddedPostgres;
import com.opentable.db.postgres.embedded.FlywayPreparer;
import com.opentable.db.postgres.embedded.PreparedDbProvider;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import org.jooby.Env;
import org.jooby.Jooby;
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
		// disable hot reloading on CI, to make sure tests work in the prod environment
		if (!System.getenv().containsKey("CI")) {
			RockerRuntime.getInstance().setReloading(true);
		}
		use(new EmbeddedPostgresModule());
		Prod.common(this);
		Prod.controllers(this);
		use(new Whoops());
	}

	static class EmbeddedPostgresModule implements Jooby.Module {
		EmbeddedPostgres postgres;

		@Override
		public Config config() {
			try {
				postgres = EmbeddedPostgres.builder()
						.setCleanDataDirectory(true)
						.start();

				DatabasePreparer prep = FlywayPreparer.forClasspathLocation("db/migration");
				PreparedDbProvider provider = PreparedDbProvider.forPreparer(prep);
				String jdbcUrl = provider.createDatabase();

				Map<String, String> map = new HashMap<>();
				map.put("db.url", jdbcUrl);
				map.put("db.user", "postgres");
				map.put("db.password", "postgres");
				return ConfigFactory.parseMap(map);
			} catch (Exception e) {
				throw Errors.asRuntime(e);
			}
		}

		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			env.onStop(postgres::close);
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
