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
import controllers.TakeEmail;
import controllers.TakeReaction;
import controllers.Takes;
import java.security.SecureRandom;
import java.util.Random;
import javax.sql.DataSource;
import json.JsoniterModule;
import org.flywaydb.core.Flyway;
import org.jooby.Jooby;
import org.jooby.Results;
import org.jooby.jdbc.Jdbc;
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
		use(new FoundationMigrationModule());
		controllers(this);
	}

	static void common(Jooby jooby) {
		jooby.use(new IpGetter.Module());
		CustomAssets.initTemplates(jooby);
		EmailSender.init(jooby);
		Mods.init(jooby);
		jooby.use(new Jdbc());
		jooby.use(new jOOQ());
		// The process of loading the foundation screws up JsoniterModule.
		// Therefore, we have to load searchModule first, so that JsoniterModule
		// is all setup afterwards.  TODO: compile the index so that we don't have
		// to do this on every load
		jooby.use(new SearchModule());
		jooby.use(new JsoniterModule());
	}

	static void controllers(Jooby jooby) {
		jooby.get("favicon.ico", () -> Results.noContent());
		jooby.use(new Redirects());
		jooby.use(new DiscourseAuth());
		jooby.use(new HomeFeed());
		jooby.use(new FoundationAssets());
		jooby.use(new About());
		jooby.use(new Drafts());
		jooby.use(new AuthModule());
		jooby.use(new NotFound());
		jooby.use(new TakeReaction());
		jooby.use(new TakeEmail());
		// These controllers need to be last, because otherwise
		// they will swallow every `/user` and `/user/take` URL.
		jooby.use(new Takes());
		jooby.use(new Profile());
	}

	public static void main(String[] args) {
		Jooby.run(Prod.class, args);
	}
}
