/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Result;
import org.jooby.Results;
import org.jooby.Status;

public class NotFound implements Jooby.Module {
	public static Result result() {
		return Results.with(views.error404.template(), Status.NOT_FOUND);
	}

	public static RuntimeException exception() {
		return new NotFoundException();
	}

	static class NotFoundException extends RuntimeException {
		private static final long serialVersionUID = 1830308574935746133L;
	}

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().err(NotFoundException.class, (req, rsp, err) -> {
			rsp.send(result());
		});
	}
}
