/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import java.security.SecureRandom;
import java.util.Random;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.jooby.Jooby;
import org.jooby.jooq.jOOQ;

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
		common(this);
		use(new HerokuDatabase.Module());
		use(new jOOQ());
		use((env, conf, binder) -> {
			env.onStart(registry -> {
				Flyway flyway = new Flyway();
				flyway.setDataSource(registry.require(DataSource.class));
				flyway.setLocations("db/migration");
				flyway.migrate();
			});
		});
		controllers(this);
	}

	static void common(Jooby jooby) {
		// setup infrastructure
	}

	static void controllers(Jooby jooby) {
		// setup routes
	}

	public static void main(String[] args) {
		Jooby.run(Prod.class, args);
	}
}
