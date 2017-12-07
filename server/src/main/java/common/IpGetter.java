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
import org.jooby.Request;

/** Returns the client's real IP address, possibly mucked up by Heroku or IPv6 localhost issues. */
public interface IpGetter {
	String ip(Request req);

	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			if (env.name().equals(HerokuDatabase.ENV)) {
				binder.bind(IpGetter.class).toInstance(req -> {
					// handles Heroku's X-Forwarded-For
					// We trust https://stackoverflow.com/a/37061471/1153071 instead of https://stackoverflow.com/a/18517550/1153071
					String xForwardedFor = req.header("X-Forwarded-For").value();
					int idx = xForwardedFor.indexOf(',');
					if (idx == -1) {
						return xForwardedFor;
					} else {
						return xForwardedFor.substring(0, idx);
					}
				});
			} else {
				binder.bind(IpGetter.class).toInstance(req -> {
					String ip = req.ip();
					if (ip.equals("::1") || ip.equals("0:0:0:0:0:0:0:1")) {
						// fixup localhost for local testing
						return "127.0.0.1";
					} else {
						return ip;
					}
				});
			}
		}
	}
}
