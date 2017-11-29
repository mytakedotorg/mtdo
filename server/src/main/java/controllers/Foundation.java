/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.MediaType;
import org.jooby.handlers.AssetHandler;

public class Foundation implements Jooby.Module {
	public static final String URL = "/foundation";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(URL, () -> views.Placeholder.foundation.template());
		env.router().get(URL + "/:anything", () -> views.Placeholder.foundation.template());
		env.router().assets(Routes.FOUNDATION_DATA_INDEX, new AssetHandler(Routes.FOUNDATION_DATA_INDEX)).produces(MediaType.json);
		env.router().assets(Routes.FOUNDATION_DATA + "/*").produces(MediaType.json);
	}
}
