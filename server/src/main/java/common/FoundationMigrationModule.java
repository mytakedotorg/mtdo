/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import static db.Tables.FOUNDATION_REV;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREVISION;

import com.google.common.collect.ImmutableSortedMap;
import com.google.common.primitives.Ints;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import db.tables.records.FoundationRevRecord;
import db.tables.records.TakepublishedRecord;
import db.tables.records.TakerevisionRecord;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooq.DSLContext;
import org.jooq.Result;
import org.jooq.impl.DSL;

public class FoundationMigrationModule implements Jooby.Module {
	private static final ImmutableSortedMap<Integer, FoundationMigration> MIGRATIONS = ImmutableSortedMap.of(
			2, FoundationMigration.createReplacing("V2__video_duration_and_encode"),
			3, FoundationMigration.createReplacing("V3__video_new_transcripts"));

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.onStart(registry -> {
			Time time = registry.require(Time.class);
			try (DSLContext dsl = registry.require(DSLContext.class)) {
				migrate(dsl, time);
			}
		});
	}

	static Set<Integer> migrate(DSLContext dsl, Time time) {
		int latestRev = dsl.selectFrom(FOUNDATION_REV)
				.orderBy(FOUNDATION_REV.VERSION.desc())
				.limit(1)
				.fetch(FOUNDATION_REV.VERSION)
				.get(0);
		Set<Integer> publishedTakesToRefresh = new HashSet<>();
		ImmutableSortedMap<Integer, FoundationMigration> toMigrate = MIGRATIONS.tailMap(latestRev + 1);
		toMigrate.forEach((version, migration) -> {
			dsl.transaction(configuration -> {
				try (DSLContext updateDocs = DSL.using(configuration)) {
					List<Integer> needsRefresh = migrate(updateDocs, time, version, migration);
					publishedTakesToRefresh.addAll(needsRefresh);
				}
			});
		});
		return publishedTakesToRefresh;
	}

	private static List<Integer> migrate(DSLContext dsl, Time time, int version, FoundationMigration migration) {
		long startMs = time.nowMs();
		// update take drafts
		Result<TakerevisionRecord> revs = dsl.fetch(TAKEREVISION);
		for (TakerevisionRecord rev : revs) {
			String original = rev.getBlocks();
			String migrated = migration.migrate(original);
			if (original != migrated) {
				rev.setBlocks(migrated);
				rev.store();
			}
		}

		// update published takes and remember the ids we updated
		List<Integer> takeIdsToRefresh = new ArrayList<>();
		Result<TakepublishedRecord> publisheds = dsl.fetch(TAKEPUBLISHED);
		for (TakepublishedRecord published : publisheds) {
			String original = published.getBlocks();
			String migrated = migration.migrate(original);
			if (!original.equals(migrated)) {
				published.setBlocks(migrated);
				published.store();
				takeIdsToRefresh.add(published.getId());
			}
		}
		int elapsed = Ints.saturatedCast((time.nowMs() - startMs) / 1000L);

		// add a record of our migration
		FoundationRevRecord record = dsl.newRecord(FOUNDATION_REV);
		record.setVersion(version);
		record.setDescription(migration.description());
		record.setMigratedOn(time.nowTimestamp());
		record.setExecutionTimeSec(elapsed);
		record.insert();

		return takeIdsToRefresh;
	}
}
