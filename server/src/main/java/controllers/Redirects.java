/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
