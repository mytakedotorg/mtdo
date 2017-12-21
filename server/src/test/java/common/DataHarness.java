/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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
