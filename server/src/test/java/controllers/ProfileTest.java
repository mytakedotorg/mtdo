/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import common.JoobyDevRule;
import common.Snapshot;
import db.enums.Reaction;
import db.tables.pojos.Account;
import db.tables.pojos.Takepublished;
import db.tables.records.TakereactionRecord;
import org.jooq.DSLContext;
import org.junit.ClassRule;
import org.junit.Test;

public class ProfileTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void stars() {
		Account other = dev.fetchRecord(ACCOUNT, ACCOUNT.USERNAME, "other").into(Account.class);
		Takepublished take = dev.fetchRecord(TAKEPUBLISHED, TAKEPUBLISHED.TITLE, "Why it's so hard to have peace").into(Takepublished.class);
		// make other star somebody else's take
		try (DSLContext dsl = dev.dsl()) {
			TakereactionRecord reaction = dsl.newRecord(TAKEREACTION);
			reaction.setUserId(other.getId());
			reaction.setTakeId(take.getId());
			reaction.setKind(Reaction.like);
			reaction.setReactedIp("127.0.0.1");
			reaction.setReactedAt(dev.time().nowTimestamp());
			reaction.insert();
		}
		// look at other's stars
		Snapshot.match("stars", dev.givenUser("other").get("other?tab=stars"));
	}
}
