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

import common.Dev.GreenMailModule;
import common.Dev.JooqDebugRenderer;
import java.security.SecureRandom;
import org.jooby.Jooby;
import org.jooby.Results;

public class DevNoDB extends Jooby {
	public DevNoDB() {
		// make random and time repeatable test to test 
		use((env, conf, binder) -> {
			SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
			random.setSeed(new byte[1]);
			binder.bind(SecureRandom.class).toInstance(random);
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
