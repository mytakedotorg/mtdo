/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
package common;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import java.util.Objects;
import org.jooby.Env;
import org.jooby.Err;
import org.jooby.Jooby;
import org.jooby.Status;

/**
 * An exception which will trigger a redirect
 * to a given URL with a given status code. 
 */
public class RedirectException extends RuntimeException {
	private static final long serialVersionUID = 583334612994239542L;

	/** The status code of the redirect. */
	private final Status status;
	/** The url to redirect to. */
	private final String redirectUrl;

	private RedirectException(Status status, String redirectUrl) {
		this.status = Objects.requireNonNull(status);
		this.redirectUrl = Objects.requireNonNull(redirectUrl);
	}

	public static RedirectException permanent(String url) {
		return new RedirectException(Status.MOVED_PERMANENTLY, url);
	}

	public static RedirectException temporary(String url) {
		return new RedirectException(Status.TEMPORARY_REDIRECT, url);
	}

	@Override
	public String getMessage() {
		return "Redirect to " + redirectUrl + " with " + status;
	}

	/**
	 * Redirects with status 404 to `/notFound` and shows the given
	 * error message to the user.  Meant for a valid url to a restricted
	 * or non-existent resource, e.g. `/notarealuser/notarealtake` or
	 * `/arealuser/aprivatetake`.
	 */
	public static Err notFoundError(String error) {
		return new Err(Status.NOT_FOUND, error);
	}

	public static Err notFoundError() {
		return notFoundError("No such URL.");
	}

	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			env.router().err(RedirectException.class, (req, rsp, err) -> {
				Status status = ((RedirectException) err.getCause()).status;
				String url = ((RedirectException) err.getCause()).redirectUrl;
				rsp.redirect(status, url);
			});
		}
	}
}
