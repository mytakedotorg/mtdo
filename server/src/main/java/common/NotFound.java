/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import org.jooby.Result;
import org.jooby.Results;
import org.jooby.Status;

public class NotFound {
	public static Result result() {
		return Results.with(views.error404.template(), Status.NOT_FOUND);
	}
}
