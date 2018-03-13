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

		// Ask if "samples" follows "other"
		FollowJson.FollowAskReq otherReq = new FollowJson.FollowAskReq();
		otherReq.username = "other";
		FollowJson.FollowRes otherRes = JsonPost.post(
				dev.givenUser("samples"),
				otherReq,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(otherRes.isFollowing).isEqualTo(true);

		// Ask if "other" follow "samples"
		FollowJson.FollowAskReq samplesReq = new FollowJson.FollowAskReq();
		samplesReq.username = "samples";
		FollowJson.FollowRes samplesRes = JsonPost.post(
				dev.givenUser("other"),
				samplesReq,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(samplesRes.isFollowing).isEqualTo(false);

		// Tell "other" to follow "samples"
		FollowJson.FollowTellReq tellReq = new FollowJson.FollowTellReq();
		tellReq.username = "samples";
		tellReq.isFollowing = true;
		FollowJson.FollowRes nextSamplesRes = JsonPost.post(
				dev.givenUser("other"),
				tellReq,
				Routes.API_FOLLOW_TELL,
				FollowJson.FollowRes.class);
		Assertions.assertThat(nextSamplesRes.isFollowing).isEqualTo(true);

		// Ask if "other" follow "samples" again
		FollowJson.FollowAskReq samplesSecondReq = new FollowJson.FollowAskReq();
		samplesSecondReq.username = "samples";
		FollowJson.FollowRes samplesSecondRes = JsonPost.post(
				dev.givenUser("other"),
				samplesSecondReq,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(samplesSecondRes.isFollowing).isEqualTo(true);

		// Tell "other" to unfollow "samples"
		FollowJson.FollowTellReq nextTellReq = new FollowJson.FollowTellReq();
		nextTellReq.username = "samples";
		nextTellReq.isFollowing = false;
		FollowJson.FollowRes anotherSamplesRes = JsonPost.post(
				dev.givenUser("other"),
				nextTellReq,
				Routes.API_FOLLOW_TELL,
				FollowJson.FollowRes.class);
		Assertions.assertThat(anotherSamplesRes.isFollowing).isEqualTo(false);

		// Ask if "other" follow "samples" again
		FollowJson.FollowRes lastSamplesRes = JsonPost.post(
				dev.givenUser("other"),
				samplesSecondReq,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(lastSamplesRes.isFollowing).isEqualTo(false);
	}
}
