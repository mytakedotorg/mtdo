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
import org.jooby.handlers.AssetHandler;

public class FoundationAssets implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.FOUNDATION, () -> views.Placeholder.foundation.template(SocialEmbed.todo()));
		// Foundation catch-all (nothing is highlighted)
		env.router().get(Routes.FOUNDATION + "/**", req -> {
			String path = req.rawPath();
			int embedSlash = path.indexOf('/', Routes.FOUNDATION.length() + 1);
			SocialEmbed embed;
			if (embedSlash == -1) {
				String titleSlug = path.substring(Routes.FOUNDATION.length() + 1);
				if (titleSlug.isEmpty()) { // trailing slash
					throw RedirectException.permanent(Routes.FOUNDATION);
				}
				// title may be empty
				embed = SocialEmbed.todo(titleSlug);
			} else {
				String embedRison = path.substring(embedSlash + 1);
				if (embedRison.isEmpty()) {  // trailing slash
					throw RedirectException.permanent(path.substring(0, embedSlash));
				}
				embed = SocialEmbed.get(req, embedRison);
			}
			return views.Placeholder.foundation.template(embed);
		});
		env.router().assets(Routes.FOUNDATION_INDEX_HASH, new AssetHandler(Routes.FOUNDATION_INDEX_HASH).etag(false).maxAge(0));
		env.router().assets(Routes.FOUNDATION_DATA + "/*");
	}
}
