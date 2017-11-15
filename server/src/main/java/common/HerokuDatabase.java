/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import org.jooby.Env;
import org.jooby.Jooby;

/** Parses the Heroke database env variable format. */
public class HerokuDatabase {
	/** Parses the database settings from a Heroku env variable. */
	public static class Module implements Jooby.Module {
		@Override
		public Config config() {
			HerokuDatabase heroku = HerokuDatabase.parseFromEnv();
			Map<String, String> map = new HashMap<>();
			map.put("db.url", heroku.jdbcUrl());
			map.put("db.user", heroku.username);
			map.put("db.password", heroku.password);
			return ConfigFactory.parseMap(map);
		}

		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {}
	}

	public final String username, password, url;

	public String jdbcUrl() {
		return "jdbc:postgresql://" + url;
	}

	private HerokuDatabase(String username, String password, String url) {
		this.username = username;
		this.password = password;
		this.url = url;
	}

	public static HerokuDatabase parseFrom(String value) {
		URI dbUri = Errors.rethrow().get(() -> new URI(value));

		String username = dbUri.getUserInfo().split(":")[0];
		String password = dbUri.getUserInfo().split(":")[1];
		String url = dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();
		if (dbUri.getQuery() != null) {
			url += "?" + dbUri.getQuery();
		}
		return new HerokuDatabase(username, password, url);
	}

	public static HerokuDatabase parseFromEnv() {
		String DATABASE_URL = System.getenv("DATABASE_URL");
		Objects.requireNonNull(DATABASE_URL, "DATABASE_URL should be set as env variable in Heroku format");
		return parseFrom(DATABASE_URL);
	}
}
