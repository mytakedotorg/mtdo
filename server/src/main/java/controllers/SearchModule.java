/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.Lucene;
import java2ts.Routes;
import java2ts.Search;
import org.jooby.Env;
import org.jooby.Jooby;

public class SearchModule implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		Lucene module = Lucene.forFacts();
		binder.bind(Lucene.class).toInstance(module);
		env.onStop(module::close);
		env.router().post(Routes.API_SEARCH, req -> {
			Search.Request request = req.body(Search.Request.class);
			Lucene lucene = req.require(Lucene.class);
			return lucene.searchDebate(request);
		});
		env.router().get(Routes.SEARCH, req -> {
			try {
				Search.Request request = req.params(Search.Request.class);
				String searchTerm = request.q;
				return views.Search.searchResults.template(searchTerm);
			} catch (NullPointerException e) {
				return "TODO";
			}
		});
	}
}
