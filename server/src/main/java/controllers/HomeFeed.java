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
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.CacheControl;
import common.SocialEmbed;
import org.jooby.Env;
import org.jooby.Jooby;

public class HomeFeed implements Jooby.Module {
	public static final String URL = "/";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(URL, (req, res) -> {
			CacheControl.hour(res).send(views.Placeholder.home.template(SocialEmbed.homepage()));
		});
	}
}
