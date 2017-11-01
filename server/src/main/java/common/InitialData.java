/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import com.google.inject.Binder;
import com.typesafe.config.Config;
import db.Tables;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooq.DSLContext;

/** This is for setting the initial data for the case that the database is empty. */
public class InitialData {
	/** If the database is empty, initializes with some data. */
	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			env.onStart(registry -> {
				try (DSLContext dsl = registry.require(DSLContext.class)) {
					int numAccounts = dsl.fetchCount(Tables.ACCOUNT);
					if (numAccounts == 0) {
						init(dsl, registry.require(Time.class));
					}
				}
			});
		}
	}

	public static void init(DSLContext dsl, Time time) {
		// TODO: populate some reasonable initial data
	}
}
