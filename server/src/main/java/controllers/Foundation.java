/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import org.jooby.Env;
import org.jooby.Jooby;

public class Foundation implements Jooby.Module {
	public static final String URL = "/foundation";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(URL, () -> views.Placeholder.foundation.template());
		env.router().get(URL + "/:anything", () -> views.Placeholder.foundation.template());
	}
}
