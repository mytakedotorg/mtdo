/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;
import static db.Tables.FOLLOW;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import common.JoobyDevRule;
import common.JsonPost;
import common.Snapshot;
import db.enums.Reaction;
import db.tables.pojos.Account;
import db.tables.pojos.Takepublished;
import db.tables.records.FollowRecord;
import db.tables.records.TakereactionRecord;
import java2ts.FollowJson;
import java2ts.Routes;
import org.assertj.core.api.Assertions;
import org.jooq.DSLContext;
import org.junit.ClassRule;
import org.junit.Test;

public class ProfileTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();
	private Account other = dev.fetchRecord(ACCOUNT, ACCOUNT.USERNAME, "other").into(Account.class);

	@Test
	public void stars() {
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

	@Test
	public void followers() {
		Account samples = dev.fetchRecord(ACCOUNT, ACCOUNT.USERNAME, "samples").into(Account.class);
		try (DSLContext dsl = dev.dsl()) {
			// make "samples" follow "other"
			FollowRecord follow = dsl.newRecord(FOLLOW);
			follow.setAuthor(other.getId());
			follow.setFollower(samples.getId());
			follow.setFollowedAt(dev.time().nowTimestamp());
			follow.insert();
		}
		Snapshot.match("/followers", dev.givenUser("other").get("other?tab=followers"));
		Snapshot.match("/following", dev.givenUser("samples").get("samples?tab=following"));
	}

	@Test
	public void followAsk() {
		FollowJson.FollowAskReq req = new FollowJson.FollowAskReq();
		req.username = "samples";
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("other"),
				req,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		// Does "other" follow "samples"?
		Assertions.assertThat(res.isFollowing).isEqualTo(false);

		req.username = "other";
		res = JsonPost.post(
				dev.givenUser("samples"),
				req,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);

		// Does "samples" follow "other"?
		Assertions.assertThat(res.isFollowing).isEqualTo(true);
	}
}
