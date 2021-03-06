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
import forms.meta.MetaField;
import java.util.ArrayList;
import java2ts.Routes;
import java2ts.Search;
import java2ts.Search.FactResultList;
import org.jooby.Env;
import org.jooby.Jooby;
import org.mytake.lucene.Lucene;

public class SearchModule implements Jooby.Module {
	private static final MetaField<String> Q = MetaField.string(Search.QUERY);
	private static final MetaField<String> H = MetaField.string(Search.HASH);

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		Lucene lucene = Lucene.loadFromDefaultFolder();
		// warmup
		lucene.searchDebate("cuba");
		lucene.searchDebate("wall,-wall street");
		// clean exit
		env.onStop(() -> {
			lucene.close();
		});
		env.router().get(Routes.API_SEARCH, (req, res) -> {
			CacheControl.corsAllowAll(res);
			if (lucene.hash().equals(H.parse(req))) {
				CacheControl.forever(res);
			} else {
				CacheControl.bypass(res);
			}
			FactResultList result;
			try {
				result = lucene.searchDebate(Q.parse(req));
			} catch (Lucene.TooManyResultsException e) {
				result = new FactResultList();
				result.facts = new ArrayList<>();
				result.errorMessage = e.getMessage();
			}
			res.send(result);
		});
		env.router().get(Routes.SEARCH, (req, res) -> {
			String query = Q.parseOrDefault(req, "");
			if (query.isEmpty()) {
				CacheControl.forever(res).redirect(Routes.FOUNDATION);
			} else {
				CacheControl.hour(res).send(views.Search.searchResults.template(query, SocialEmbed.search(query)));
			}
		});
	}
}
