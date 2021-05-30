/*
 * MyTake.org website and tooling.
 * Copyright (C) 2021 MyTake.org, Inc.
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
package controllers;

import common.EmailSender;
import common.Time;
import java.security.SecureRandom;
import javax.inject.Inject;
import org.jooby.quartz.Scheduled;
import org.jooq.DSLContext;

/** Possibly stupid, but might help with GC issues. We'll see! */
public class ForceGc extends ErrorPages.ScheduledJob {
	@Inject
	public ForceGc(SecureRandom random, EmailSender email, DSLContext dsl, Time time) {
		super(random, email, dsl, time);
	}

	@Scheduled("30minutes")
	public void schedule() {
		System.gc();
	}
}
