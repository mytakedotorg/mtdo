/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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

import com.jsoniter.JsonIterator;
import common.JoobyDevRule;
import common.JsonPost;
import common.Snapshot;
import common.TakeBuilder;
import io.restassured.http.ContentType;
import java.util.function.Consumer;
import java2ts.DraftPost;
import java2ts.DraftRev;
import java2ts.PublishResult;
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
		return JsonPost.post(dev.givenUser("samples"), post, "/drafts/save", DraftRev.class);
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
		post.imageUrl = "someImage.png";

		byte[] body = dev.givenUser("samples")
				.contentType(ContentType.JSON)
				.body(post.toJson())
				.post("/drafts/publish")
				.then()
				.statusCode(Status.OK.value())
				.extract().asByteArray();
		PublishResult result = JsonIterator.deserialize(body, PublishResult.class);
		Assertions.assertThat(result.publishedUrl).isEqualTo("/samples/a-test-article");
		Assertions.assertThat(result.conflict).isFalse();
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
