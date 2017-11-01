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

/** Time provider where time can be manually forwarded by the test. */
public class DevTime implements Time {
	private long currentMs = 0L;

	public void setCurrentMs(long currentMs) {
		this.currentMs = currentMs;
	}

	@Override
	public long nowMs() {
		return currentMs;
	}

	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			binder.bind(Time.class).toInstance(new DevTime());
		}
	}
}
