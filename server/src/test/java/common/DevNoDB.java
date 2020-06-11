/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import common.Dev.GreenMailModule;
import common.Dev.JooqDebugRenderer;
import java.security.SecureRandom;
import java.util.Random;
import org.jooby.Jooby;
import org.jooby.Results;

public class DevNoDB extends Jooby {
	public DevNoDB() {
		// make random and time repeatable test to test 
		use((env, conf, binder) -> {
			SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
			random.setSeed(new byte[1]);
			binder.bind(Random.class).toInstance(random);
		});
		use(new GreenMailModule());
		Prod.commonNoDb(this);
		use(new JooqDebugRenderer());
		use((env, conf, binder) -> {
			env.router().get("/exit", req -> {
				stop();
				return Results.ok();
			});
		});
	}
}
