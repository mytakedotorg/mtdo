/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2021 MyTake.org, Inc.
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

import static db.Tables.ACCOUNT;
import static db.Tables.FOLLOW;
import static db.Tables.TAKEPUBLISHED;
import static db.Tables.TAKEREACTION;

import common.DbMisc;
import common.JoobyDevRule;
import common.JsonPost;
import common.Snapshot;
import db.enums.Reaction;
import db.tables.records.AccountRecord;
import db.tables.records.FollowRecord;
import db.tables.records.TakepublishedRecord;
import db.tables.records.TakereactionRecord;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java2ts.FollowJson;
import java2ts.Routes;
import org.assertj.core.api.Assertions;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ProfileTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();
	private AccountRecord other = DbMisc.fetchOne(dev.dsl(), ACCOUNT.USERNAME, "other");

	@Test
	public void stars() {
		TakepublishedRecord take = DbMisc.fetchOne(dev.dsl(), TAKEPUBLISHED.TITLE, "Why it's so hard to have peace");
		// make other star somebody else's take
		TakereactionRecord reaction = dev.dsl().newRecord(TAKEREACTION);
		reaction.setUserId(other.getId());
		reaction.setTakeId(take.getId());
		reaction.setKind(Reaction.like);
		reaction.setReactedIp("127.0.0.1");
		reaction.setReactedAt(dev.time().now());
		reaction.insert();
		// look at other's stars
		Snapshot.match("stars", dev.givenUser("other").get("other?tab=stars"));
	}

	@Test
	public void _01_followers() {
		AccountRecord samples = DbMisc.fetchOne(dev.dsl(), ACCOUNT.USERNAME, "samples");
		// make "samples" follow "other"
		FollowRecord follow = dev.dsl().newRecord(FOLLOW);
		follow.setAuthor(other.getId());
		follow.setFollower(samples.getId());
		follow.setFollowedAt(dev.time().now());
		follow.insert();
		Snapshot.match("/followers", dev.givenUser("other").get("other?tab=followers"));
		Snapshot.match("/following", dev.givenUser("samples").get("samples?tab=following"));
	}

	@Test
	public void _02_followAskTrue() {
		// Ask if "samples" follows "other"
		FollowJson.FollowAskReq req = new FollowJson.FollowAskReq();
		req.username = "other";
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("samples"),
				req,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(res.isFollowing).isEqualTo(true);
	}

	@Test
	public void _03_followAskFalse() {
		// Ask if "other" follow "samples"
		FollowJson.FollowAskReq req = new FollowJson.FollowAskReq();
		req.username = "samples";
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("other"),
				req,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(res.isFollowing).isEqualTo(false);
	}

	@Test
	public void _04_followTellTrue() {
		// Tell "other" to follow "samples"
		FollowJson.FollowTellReq req = new FollowJson.FollowTellReq();
		req.username = "samples";
		req.isFollowing = true;
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("other"),
				req,
				Routes.API_FOLLOW_TELL,
				FollowJson.FollowRes.class);
		Assertions.assertThat(res.isFollowing).isEqualTo(true);
	}

	@Test
	public void _05_followAskWasFalseNowTrue() {
		// Ask if "other" follow "samples" again
		FollowJson.FollowAskReq req = new FollowJson.FollowAskReq();
		req.username = "samples";
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("other"),
				req,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(res.isFollowing).isEqualTo(true);
	}

	@Test
	public void _06_followTellFalse() {
		// Tell "other" to unfollow "samples"
		FollowJson.FollowTellReq req = new FollowJson.FollowTellReq();
		req.username = "samples";
		req.isFollowing = false;
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("other"),
				req,
				Routes.API_FOLLOW_TELL,
				FollowJson.FollowRes.class);
		Assertions.assertThat(res.isFollowing).isEqualTo(false);
	}

	@Test
	public void _07_followAskWasTrueNowFalse() {
		FollowJson.FollowAskReq req = new FollowJson.FollowAskReq();
		req.username = "samples";
		// Ask if "other" follow "samples" again
		FollowJson.FollowRes res = JsonPost.post(
				dev.givenUser("other"),
				req,
				Routes.API_FOLLOW_ASK,
				FollowJson.FollowRes.class);
		Assertions.assertThat(res.isFollowing).isEqualTo(false);
	}

	@Test
	public void followNotLoggedIn() {
		FollowJson.FollowAskReq req = new FollowJson.FollowAskReq();
		req.username = "samples";
		RestAssured.given()
				.contentType(ContentType.JSON)
				.body(req.toJson())
				.post(Routes.API_FOLLOW_ASK)
				.then()
				.statusCode(Status.TEMPORARY_REDIRECT.value());

		RestAssured.given()
				.contentType(ContentType.JSON)
				.body(req.toJson())
				.post(Routes.API_FOLLOW_TELL)
				.then()
				.statusCode(Status.TEMPORARY_REDIRECT.value());
	}
}
