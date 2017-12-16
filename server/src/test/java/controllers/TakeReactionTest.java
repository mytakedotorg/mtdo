/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import common.JoobyDevRule;
import common.JsonPost;
import db.enums.Reaction;
import io.restassured.RestAssured;
import java.util.HashSet;
import java.util.Set;
import java2ts.Routes;
import java2ts.TakeReactionJson;
import java2ts.TakeReactionJson.UserState;
import javax.annotation.Nullable;
import org.assertj.core.api.Assertions;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class TakeReactionTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	private static final int TEST_TAKE_ID = 1;

	private static TakeReactionJson.ViewRes viewForUser(@Nullable String username) {
		TakeReactionJson.ViewReq req = new TakeReactionJson.ViewReq();
		req.take_id = TEST_TAKE_ID;
		return JsonPost.post(username == null ? RestAssured.given() : dev.givenUser(username),
				req, Routes.API_TAKE_VIEW, TakeReactionJson.ViewRes.class);
	}

	private static void assertViewsLikes(TakeReactionJson.TakeState takeState, int views, int likes) {
		Assertions.assertThat(takeState.viewCount).isEqualTo(views);
		Assertions.assertThat(takeState.likeCount).isEqualTo(likes);
	}

	private static void assertUserState(TakeReactionJson.UserState userState, Reaction... expected) {
		Assertions.assertThat(userState).isNotNull();
		Set<Reaction> actuals = new HashSet<>();
		for (Reaction actual : TakeReaction.REACTIONS_NON_VIEW) {
			if (TakeReaction.getReaction(userState, actual)) {
				actuals.add(actual);
			}
		}
		Assertions.assertThat(actuals).containsExactlyInAnyOrder(expected);
	}

	@Test
	public void _01_viewNotLoggedIn() {
		TakeReactionJson.ViewRes res = viewForUser(null);
		Assertions.assertThat(res.userState).isNull();
		assertViewsLikes(res.takeState, 0, 0);
	}

	@Test
	public void _02_viewLoggedIn() {
		TakeReactionJson.ViewRes res = viewForUser("samples");
		assertUserState(res.userState);
		assertViewsLikes(res.takeState, 1, 0);
	}

	private static TakeReactionJson.ReactRes reactForUser(String username, UserState userState) {
		TakeReactionJson.ReactReq req = new TakeReactionJson.ReactReq();
		req.take_id = TEST_TAKE_ID;
		req.userState = userState;
		return JsonPost.post(dev.givenUser(username), req, Routes.API_TAKE_REACT, TakeReactionJson.ReactRes.class);
	}

	@Test
	public void _03_like() {
		UserState userState = new UserState();
		userState.like = true;
		TakeReactionJson.ReactRes res = reactForUser("samples", userState);
		assertUserState(res.userState, Reaction.like);
		assertViewsLikes(res.takeState, 1, 1);
	}

	@Test
	public void _04_unlike_and_bookmark() {
		UserState userState = new UserState();
		userState.like = false;
		userState.bookmark = true;
		TakeReactionJson.ReactRes res = reactForUser("samples", userState);
		assertUserState(res.userState, Reaction.bookmark);
		assertViewsLikes(res.takeState, 1, 0);
	}

	@Test
	public void _05_other_view() {
		TakeReactionJson.ViewRes res = viewForUser("other");
		assertUserState(res.userState);
		assertViewsLikes(res.takeState, 2, 0);
	}
}
