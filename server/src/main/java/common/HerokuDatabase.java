/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
	public static final String ENV = "heroku";

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

		String username = dbUri.getUserInfo().split(":", -1)[0];
		String password = dbUri.getUserInfo().split(":", -1)[1];
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
