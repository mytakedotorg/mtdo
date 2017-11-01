/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import java.security.SecureRandom;
import java.util.Random;
import org.jooby.Jooby;

/**
 * The app that we run in production.  See {@link Dev} in the test
 * directory for the app that we run in testing.
 */
public class Prod extends Jooby {
	{
		use((env, conf, binder) -> {
			binder.bind(Random.class).toInstance(SecureRandom.getInstanceStrong());
		});
		common(this);
		controllers(this);
	}

	static void common(Jooby jooby) {
		// setup infrastructure
	}

	static void controllers(Jooby jooby) {
		// setup routes
	}

	public static void main(String[] args) {
		Jooby.run(Prod.class, args);
	}
}
