/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import auth.AuthModule;
import controllers.About;
import controllers.DiscourseAuth;
import controllers.Drafts;
import controllers.FoundationAssets;
import controllers.HomeFeed;
import controllers.Profile;
import controllers.Redirects;
import controllers.SearchModule;
import controllers.Shares;
import controllers.TakeEmail;
import controllers.TakeReaction;
import controllers.Takes;
import java.security.SecureRandom;
import java.util.Random;
import javax.sql.DataSource;
import json.JsoniterModule;
import org.flywaydb.core.Flyway;
import org.jooby.Jooby;
import org.jooby.Registry;
import org.jooby.jdbc.Jdbc;
import org.jooby.jooq.jOOQ;

/**
 * The app that we run in production.  See {@link Dev} in the test
 * directory for the app that we run in testing.
 */
public class Prod extends Jooby {
	{
		use((env, conf, binder) -> {
			// prevent SecureRandom starvation in a shared hosting environment
			// https://tersesystems.com/blog/2015/12/17/the-right-way-to-use-securerandom/
			SecureRandom nativeRandom = SecureRandom.getInstanceStrong();
			byte[] seed = nativeRandom.generateSeed(55);
			SecureRandom pureJava = SecureRandom.getInstance("SHA1PRNG");
			pureJava.setSeed(seed);
			binder.bind(Random.class).toInstance(pureJava);
		});
		realtime(this);
		use(new HerokuDatabase.Module());
		commonNoDb(this);
		commonDb(this);
		use((env, conf, binder) -> {
			env.onStart(Prod::flywayMigrate);
		});
		use(new InitialData.Module());
		use(new FoundationMigrationModule());
		controllers(this);
	}

	static void flywayMigrate(Registry registry) {
		Flyway.configure()
				.dataSource(registry.require(DataSource.class))
				.locations("db/migration")
				.baselineVersion("1")
				.baselineOnMigrate(true)
				.load()
				.migrate();
	}

	static void realtime(Jooby jooby) {
		jooby.use((env, conf, binder) -> {
			binder.bind(Time.class).toInstance(() -> System.currentTimeMillis());
		});
	}

	static void commonNoDb(Jooby jooby) {
		jooby.use(new IpGetter.Module());
		CustomAssets.initTemplates(jooby);
		EmailSender.init(jooby);
		Mods.init(jooby);
		jooby.use(new JsoniterModule());
	}

	static void commonDb(Jooby jooby) {
		jooby.use(new Jdbc());
		jooby.use(new jOOQ());
	}

	static void controllers(Jooby jooby) {
		jooby.use(new Redirects());
		jooby.use(new DiscourseAuth());
		jooby.use(new HomeFeed());
		jooby.use(new FoundationAssets());
		jooby.use(new SearchModule());
		jooby.use(new About());
		jooby.use(new Drafts());
		jooby.use(new AuthModule());
		jooby.use(new NotFound());
		jooby.use(new TakeReaction());
		jooby.use(new TakeEmail());
		jooby.use(new Shares());
		// These controllers need to be last, because otherwise
		// they will swallow every `/user/take` and `/user` URL.
		jooby.use(new Takes());
		jooby.use(new Profile());
	}

	public static void main(String[] args) {
		Jooby.run(Prod.class, args);
	}
}
