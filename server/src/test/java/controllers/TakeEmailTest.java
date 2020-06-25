/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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

import com.google.common.collect.ImmutableMap;
import com.jsoniter.JsonIterator;
import com.jsoniter.any.Any;
import com.jsoniter.output.EncodingMode;
import com.jsoniter.output.JsonStream;
import com.jsoniter.spi.DecodingMode;
import common.EmailAssert;
import common.JoobyDevRule;
import common.JsonPost;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
		try {
			// setMode REFLECTION_MODE because of https://github.com/json-iterator/java/issues/145
			JsonIterator.setMode(DecodingMode.REFLECTION_MODE);
			JsonStream.setMode(EncodingMode.REFLECTION_MODE);

			EmailSelf self = new EmailSelf();
			self.subject = "This is a subject.";
			self.body = "<body>Tiny venn diagram <a href=\"https://mytake.org\"><img src=\"cid:vid0\"></a>.</body>";
			self.cidMap = Any.wrap(ImmutableMap.of(
					"vid0",
					Any.wrap(
							"data:image/png;base64,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")));
			JsonPost.post(dev.givenUser("samples"), self, Routes.API_EMAIL_SELF);

			EmailAssert emailAssert = dev.waitForEmail();
			emailAssert.subject().isEqualTo(self.subject);
			// it should change the cid
			Pattern pattern = Pattern.compile("<body>Tiny venn diagram <a href=\"https:\\/\\/mytake.org\"><img src=\"cid:(.*?)\">");
			Matcher matcher = pattern.matcher(emailAssert.bodyRaw());
			matcher.find();
			// extract it
			String cidExtracted = matcher.group(1);
			// and make sure it got stuffed in as an attachment
			emailAssert.body().contains("Content-ID: <" + cidExtracted + ">");
		} finally {
			JsonIterator.setMode(DecodingMode.STATIC_MODE);
			JsonStream.setMode(EncodingMode.STATIC_MODE);
		}
	}
}
