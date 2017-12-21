/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import org.jooby.Env;
import org.jooby.Jooby;

public class HomeFeed implements Jooby.Module {
	public static final String URL = "/";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(URL, () -> views.Placeholder.home.template());
	}
}
