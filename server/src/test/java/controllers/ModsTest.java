/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package controllers;

import common.EmailAssert;
import common.JoobyDevRule;
import common.Mods;
import java.util.List;
import org.junit.ClassRule;
import org.junit.Test;

public class ModsTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void sendToMods() throws Throwable {
		Mods mods = dev.app().require(Mods.class);
		mods.send(htmlEmail -> {
			htmlEmail.setSubject("The site is down!!!");
			htmlEmail.setHtmlMsg("OH NOES!");
		});
		List<EmailAssert> emails = dev.waitForEmails(2);
		for (EmailAssert email : emails) {
			email.subject().isEqualTo("The site is down!!!");
			email.body().contains("OH NOES!");
			email.allRecipients().isEqualTo("mod1@email.com,mod2@email.com");
		}
	}
}
