/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import com.jsoniter.JsonIterator;
import common.JoobyDevRule;
import common.Snapshot;
import common.TakeBuilder;
import io.restassured.http.ContentType;
import java.util.function.Consumer;
import java2ts.DraftPost;
import java2ts.DraftRev;
import org.assertj.core.api.Assertions;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DraftsTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void _00_listDrafts() {
		Snapshot.match("samplesDrafts", dev.givenUser("samples").get("/drafts"));
		Snapshot.match("otherDrafts", dev.givenUser("other").get("/drafts"));
	}

	private DraftPost newPost() {
		DraftPost post = new DraftPost();
		post.title = "A test article";
		post.blocks = TakeBuilder.builder().p("Intro").p("Body").p("Conclusion").buildAny();
		return post;
	}

	private DraftRev postSave(Consumer<DraftPost> postSetup) {
		DraftPost post = newPost();
		postSetup.accept(post);

		byte[] body = dev.givenUser("samples")
				.contentType(ContentType.JSON)
				.body(post.toJson())
				.post("/drafts/save")
				.then()
				.statusCode(Status.OK.value())
				.extract().body().asByteArray();
		return JsonIterator.deserialize(body, DraftRev.class);
	}

	@Test
	public void _01_createNewDraft() {
		DraftRev rev = postSave(post -> {});
		Assertions.assertThat(rev.draftid).isEqualTo(4);
		Assertions.assertThat(rev.lastrevid).isEqualTo(4);
	}

	@Test
	public void _02_updateDraft() {
		DraftRev rev = postSave(post -> {
			post.parentRev = new DraftRev();
			post.parentRev.draftid = 4;
			post.parentRev.lastrevid = 4;
		});
		Assertions.assertThat(rev.draftid).isEqualTo(4);
		Assertions.assertThat(rev.lastrevid).isEqualTo(5);
	}

	@Test
	public void _03_overwriteDraft() {
		DraftRev rev = postSave(post -> {
			post.parentRev = new DraftRev();
			post.parentRev.draftid = 4;
			post.parentRev.lastrevid = 4;
		});
		Assertions.assertThat(rev.draftid).isEqualTo(5);
		Assertions.assertThat(rev.lastrevid).isEqualTo(6);
	}

	@Test
	public void _04_publishDraft() {
		DraftPost post = newPost();
		post.parentRev = new DraftRev();
		post.parentRev.draftid = 5;
		post.parentRev.lastrevid = 6;

		dev.givenUser("samples")
				.contentType(ContentType.JSON)
				.body(post.toJson())
				.post("/drafts/publish")
				.then()
				.statusCode(Status.FOUND.value())
				.header("Location", "/samples/a-test-article");
	}

	@Test
	public void _05_deleteDraft() {
		DraftRev rev = new DraftRev();
		rev.draftid = 4;
		rev.lastrevid = 4;
		// lastrevid is actually 5, so this should fail
		dev.givenUser("samples")
				.contentType(ContentType.JSON)
				.body(rev.toJson())
				.post("/drafts/delete")
				.then()
				.statusCode(Status.NOT_FOUND.value());

		// and this should succeed
		rev.lastrevid = 5;
		dev.givenUser("samples")
				.contentType(ContentType.JSON)
				.body(rev.toJson())
				.post("/drafts/delete")
				.then()
				.statusCode(Status.OK.value());
	}
}
