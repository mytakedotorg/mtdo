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
package common;

import db.enums.Reaction;
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
		for (EmailAssert email : dev.waitForEmails(2).values()) {
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
