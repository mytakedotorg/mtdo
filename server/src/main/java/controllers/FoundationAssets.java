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
import common.RedirectException;
import common.SocialEmbed;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;

public class FoundationAssets implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.FOUNDATION, () -> views.Placeholder.foundation.template(SocialEmbed.todo()));
		env.router().get(Routes.FOUNDATION + "/**", req -> {
			String path = req.rawPath();
			int embedSlash = path.lastIndexOf('/');
			String embedRison = path.substring(embedSlash + 1);
			if (embedRison.isEmpty()) {
				// trailing slash
				throw RedirectException.permanent(Routes.FOUNDATION);
			}
			return views.Placeholder.foundation.template(SocialEmbed.get(req, embedRison));
		});
	}
}
