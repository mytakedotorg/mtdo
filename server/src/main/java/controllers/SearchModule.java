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
import common.SocialEmbed;
import forms.meta.MetaField;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Results;
import org.mytake.lucene.Lucene;

public class SearchModule implements Jooby.Module {
	private static final MetaField<String> Q = MetaField.string("q");

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		Lucene lucene = Lucene.openFromArchive();
		env.onStop(() -> {
			lucene.close();
		});
		env.router().get(Routes.API_SEARCH, req -> {
			return lucene.searchDebate(Q.parse(req));
		});
		env.router().get(Routes.SEARCH, req -> {
			String query = Q.parseOrDefault(req, "");
			if (query.isEmpty()) {
				return Results.redirect(Routes.FOUNDATION);
			} else {
				return views.Search.searchResults.template(query, SocialEmbed.todo());
			}
		});
	}
}
