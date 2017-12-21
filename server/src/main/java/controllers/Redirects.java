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
import org.jooby.Results;

public class Redirects implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().get(Routes.TIMELINE, () -> Results.redirect("https://mytake.org" + Routes.FOUNDATION));
		env.router().get(Routes.ABOUTUS, () -> Results.redirect("https://mytake.org" + Routes.ABOUT));
		env.router().get(Routes.PRIVACY, () -> Results.redirect("https://meta.mytake.org/privacy"));
		env.router().get(Routes.TERMS, () -> Results.redirect("https://meta.mytake.org/tos"));
		env.router().get(Routes.TOS, () -> Results.redirect("https://meta.mytake.org/tos"));
		env.router().get(Routes.FAQ, () -> Results.redirect("https://meta.mytake.org/faq"));
		env.router().get(Routes.RULES, () -> Results.redirect("https://meta.mytake.org/faq"));
	}
}
