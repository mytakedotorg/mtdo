/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.jooby.Env;
import org.jooby.Jooby;

/** Time provider where time can be manually forwarded by the test. */
public class DevTime implements Time {
	private LocalDateTime now = LocalDateTime.ofEpochSecond(0, 0, ZoneOffset.UTC);

	public void setNow(LocalDateTime now) {
		this.now = now;
	}

	public void setYear(int year) {
		now = LocalDateTime.of(year, 1, 1, 0, 0);
	}

	@Override
	public LocalDateTime now() {
		return now;
	}

	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			binder.bind(Time.class).toInstance(new DevTime());
		}
	}
}
