/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.handlers.AssetHandler;

public class FoundationAssets implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.FOUNDATION, () -> views.Placeholder.foundation.template());
		env.router().get(Routes.FOUNDATION_V1 + "/**", () -> views.Placeholder.foundation.template());
		env.router().assets(Routes.FOUNDATION_INDEX_HASH, new AssetHandler(Routes.FOUNDATION_INDEX_HASH).etag(false).maxAge(0));
		env.router().assets(Routes.FOUNDATION_DATA + "/*");
	}
}
