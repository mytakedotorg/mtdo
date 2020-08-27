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

import auth.AuthModule;
import controllers.About;
import controllers.BookmarkApi;
import controllers.DiscourseAuth;
import controllers.Drafts;
import controllers.FoundationAssets;
import controllers.HomeFeed;
import controllers.Profile;
import controllers.Redirects;
import controllers.SearchModule;
import controllers.TakeReaction;
import controllers.Takes;
import java.security.SecureRandom;
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
			binder.bind(SecureRandom.class).toInstance(pureJava);
		});
		realtime(this);
		use(new HerokuDatabase.Module());
		commonNoDb(this);
		commonDb(this);
		use((env, conf, binder) -> {
			env.onStart(Prod::flywayMigrate);
		});
		use(new InitialData.Module());
		controllers(this);
	}

	static void flywayMigrate(Registry registry) {
		Flyway.configure()
				.dataSource(registry.require(DataSource.class))
				.locations("db/migration")
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
		SocialEmbed.init(jooby);
		jooby.use(new JsoniterModule());
		jooby.use(new MyFlash());
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
		jooby.use(new BookmarkApi());
		jooby.use(new About());
		jooby.use(new Drafts());
		jooby.use(new AuthModule());
		jooby.use(new TakeReaction());
		// These controllers need to be last, because otherwise
		// they will swallow every `/user/take` and `/user` URL.
		jooby.use(new Takes());
		jooby.use(new Profile());
		// But it is okay to put the error tracing stuff after that
		jooby.use(new RedirectException.Module());
		jooby.use(new controllers.ErrorPages());
	}

	public static void main(String[] args) {
		Jooby.run(Prod.class, args);
	}
}
