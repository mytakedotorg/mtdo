/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import db.enums.Reaction;
import java.util.List;
import org.jooby.Status;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ModsTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void _01_sendToMods() throws Throwable {
		Mods mods = dev.app().require(Mods.class);
		mods.send(htmlEmail -> {
			htmlEmail.setSubject("The site is down!!!");
			htmlEmail.setHtmlMsg("OH NOES!");
		});
		List<EmailAssert> emails = dev.waitForEmails(2);
		for (EmailAssert email : emails) {
			email.subject().isEqualTo("[MyTake.org mod] The site is down!!!");
			email.body().contains("OH NOES!");
			email.allRecipients().isEqualTo("mod1@email.com,mod2@email.com");
		}
	}

	@Test
	public void _02_testEmail() throws Throwable {
		DataHarness $ = new DataHarness(dev.app());
		// @formatter:off
		$.reactTake($.userId("samples"), "Why it's so hard to have peace", $.userId("samples"), Reaction.view, Reaction.like);
		$.reactTake($.userId("samples"), "Why it's so hard to have peace",                 $.userId("other"),   Reaction.view, Reaction.like);
		$.reactTake($.userId("samples"), "Why it's so hard to have peace",                  $.userId("empty"),   Reaction.view);
		$.reactTake($.userId("samples"), "Does a law mean what it says, or what it meant?", $.userId("empty"),   Reaction.view);
		$.reactTake($.userId("other"),   "I am a strawman",                                 $.userId("samples"), Reaction.view, Reaction.like);
		$.draft(    $.userId("empty"),   "My draft",       b -> b.p("I'll get to it").p("later on."));
		$.draft(    $.userId("empty"),   "My other draft", b -> b.p("I haven't finished"));
		$.draft(    $.userId("other"),   "DRAFT",          b -> b.p("WORDS"));
		// @formatter:on
		String html = new Mods.ModJobs(dev.app()).generateSummaryHtml();
		Snapshot.match("testEmail", html);
	}

	@Test
	public void _03_viewDraft() {
		dev.givenUser("other").get("/mods/drafts/1")
				.then()
				.statusCode(Status.NOT_FOUND.value());
		PageAssert.assertThat(dev.givenUser("mod1").get("/mods/drafts/1"), Status.OK).bodyAssertRaw(body -> {
			Snapshot.match("viewDraft", body);
		});
	}
}
