/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import java.util.Random;
import org.jooby.Jooby;

/**
 * The app that we run in unit tests.  See {@link Prod} in the main
 * directory for the app that we run in production.
 */
public class Dev extends Jooby {
	{
		// random and time-dependent results in tests will be repeatable
		use((env, conf, binder) -> {
			binder.bind(Random.class).toInstance(new Random(0));
		});
		use(new DevTime.Module());
		Prod.common(this);
		Prod.controllers(this);
	}

	public static void main(String[] args) {
		Jooby.run(Dev.class, args);
	}
}
