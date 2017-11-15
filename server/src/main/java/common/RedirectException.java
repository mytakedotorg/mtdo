/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import forms.meta.MetaField;
import org.jooby.Env;
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

	/**
	 * @param status status code of the redirect.
	 * @param redirectUrl url to redirect to 
	 */
	public RedirectException(Status status, String redirectUrl) {
		this.status = status;
		this.redirectUrl = redirectUrl;
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
	public static RedirectException notFoundError(String error) {
		return new RedirectException(Status.NOT_FOUND,
				UrlEncodedPath.path(Module.URL_notFound)
						.param(MSG, error)
						.build());
	}

	/**
	 * Redirects with status 400 to `/badRequest` and shows the given
	 * error message to the user.
	 * 
	 * Meant for when a request is inherently an error,
	 * e.g. `printCount?userCount=a`
	 */
	public static RedirectException badRequestError(String error) {
		return new RedirectException(Status.BAD_REQUEST,
				UrlEncodedPath.path(Module.URL_badRequest)
						.param(MSG, error)
						.build());
	}

	public static class Module implements Jooby.Module {
		public static final String URL_notFound = "/notFound";
		public static final String URL_badRequest = "/badRequest";

		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			env.router().err(RedirectException.class, (req, rsp, err) -> {
				Status status = ((RedirectException) err.getCause()).status;
				String url = ((RedirectException) err.getCause()).redirectUrl;
				rsp.redirect(status, url);
			});
			env.router().get(URL_notFound, req -> {
				return views.RedirectException.notFound.template(req.param(MSG.name()).value());
			});
			env.router().get(URL_badRequest, req -> {
				return views.RedirectException.badRequest.template(req.param(MSG.name()).value());
			});
		}
	}

	private static final MetaField<String> MSG = MetaField.string("msg");
}
