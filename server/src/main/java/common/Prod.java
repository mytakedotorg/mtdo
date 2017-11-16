/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import auth.AuthModule;
import controllers.AboutUs;
import controllers.Drafts;
import controllers.Foundation;
import controllers.HomeFeed;
import controllers.Takes;
import java.security.SecureRandom;
import java.util.Random;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.jooby.Jooby;
import org.jooby.Results;
import org.jooby.jdbc.Jdbc;
import org.jooby.jooq.jOOQ;
import org.jooby.mail.CommonsEmail;

/**
 * The app that we run in production.  See {@link Dev} in the test
 * directory for the app that we run in testing.
 */
public class Prod extends Jooby {
	{
		use((env, conf, binder) -> {
			binder.bind(Random.class).toInstance(SecureRandom.getInstanceStrong());
		});
		use((env, conf, binder) -> {
			binder.bind(Time.class).toInstance(() -> System.currentTimeMillis());
		});
		use(new HerokuDatabase.Module());
		common(this);
		use((env, conf, binder) -> {
			env.onStart(registry -> {
				Flyway flyway = new Flyway();
				flyway.setDataSource(registry.require(DataSource.class));
				flyway.setLocations("db/migration");
				flyway.migrate();
			});
		});
		use(new InitialData.Module());
		controllers(this);
	}

	static void common(Jooby jooby) {
		jooby.use(new CommonsEmail());
		jooby.use(new Jdbc());
		jooby.use(new jOOQ());
		CustomAssets.initTemplates(jooby);
	}

	static void controllers(Jooby jooby) {
		jooby.get("favicon.ico", () -> Results.noContent());
		jooby.use(new HomeFeed());
		jooby.use(new Foundation());
		jooby.use(new AboutUs());
		jooby.use(new Drafts());
		jooby.use(new AuthModule());
		jooby.use(new RedirectException.Module());
		// takes needs to be last, because otherwise it will swallow
		// every `/user/take` URL.
		jooby.use(new Takes());
	}

	public static void main(String[] args) {
		Jooby.run(Prod.class, args);
	}
}
