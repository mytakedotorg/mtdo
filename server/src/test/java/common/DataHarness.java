/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import db.enums.Reaction;
import db.tables.records.TakereactionRecord;
import java.util.function.Consumer;
import org.jooby.Registry;
import org.jooq.DSLContext;

public class DataHarness {
	private final DSLContext dsl;
	private final Time time;

	public DataHarness(Registry registry) {
		this.dsl = registry.require(DSLContext.class);
		this.time = registry.require(Time.class);
	}

	public int userId(String username) {
		return dsl.selectFrom(ACCOUNT)
				.where(ACCOUNT.USERNAME.eq(username))
				.fetchOne(ACCOUNT.ID);
	}

	public void reactTake(int userId, String title, int reactorId, Reaction... reactions) {
		int takeId = dsl.selectFrom(TAKEPUBLISHED)
				.where(TAKEPUBLISHED.TITLE_SLUG.eq(Text.slugify(title))
						.and(TAKEPUBLISHED.USER_ID.eq(userId)))
				.fetchOne(TAKEPUBLISHED.ID);
		for (Reaction reaction : reactions) {
			TakereactionRecord record = dsl.newRecord(TAKEREACTION);
			record.setTakeId(takeId);
			record.setUserId(reactorId);
			record.setKind(reaction);
			record.setReactedAt(time.nowTimestamp());
			record.setReactedIp("127.0.0.1");
			record.insert();
		}
	}

	public void draft(int userId, String title, Consumer<TakeBuilder> builder) {
		InitialData.draft(dsl, time, userId, title, builder);
	}
}
