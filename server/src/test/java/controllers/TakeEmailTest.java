/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import common.EmailAssert;
import common.JoobyDevRule;
import common.JsonPost;
import java2ts.EmailSelf;
import java2ts.Routes;
import javax.mail.MessagingException;
import org.junit.ClassRule;
import org.junit.Test;

public class TakeEmailTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void takeEmail() throws MessagingException {
		EmailSelf self = new EmailSelf();
		self.subject = "This is a subject.";
		self.body = "<body>This is <a href=\"https://mytake.org\">the homepage</a>.</body>";
		JsonPost.post(dev.givenUser("samples"), self, Routes.API_EMAIL_SELF);

		EmailAssert emailAssert = dev.waitForEmail();
		emailAssert.subject().isEqualTo(self.subject);
		emailAssert.body().contains(self.body);
	}
}
