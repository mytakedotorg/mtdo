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
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import java2ts.Routes;
import java2ts.Search;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Results;
import org.mytake.lucene.Lucene;

public class SearchModule implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		Lucene lucene = Lucene.openFromArchive();
		env.onStop(() -> {
			lucene.close();
		});
		env.router().post(Routes.API_SEARCH, req -> {
			Search.Request request = req.body(Search.Request.class);
			return lucene.searchDebate(request);
		});
		env.router().get(Routes.SEARCH, req -> {
			Search.Request request = req.params(Search.Request.class);
			if (request.q == null) {
				return Results.redirect(Routes.FOUNDATION);
			} else {
				return views.Search.searchResults.template(request.q);
			}
		});
	}
}
