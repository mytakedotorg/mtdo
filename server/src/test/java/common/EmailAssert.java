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

import com.icegreen.greenmail.util.GreenMailUtil;
import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.mail.Address;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import org.assertj.core.api.AbstractAssert;
import org.assertj.core.api.AbstractCharSequenceAssert;
import org.assertj.core.api.Assertions;

public class EmailAssert extends AbstractAssert<EmailAssert, MimeMessage> {
	public EmailAssert(MimeMessage actual) {
		super(actual, EmailAssert.class);
	}

	public MimeMessage getActual() {
		return actual;
	}

	public AbstractCharSequenceAssert<?, String> allRecipients() throws MessagingException {
		String recipients = Arrays.stream(actual.getAllRecipients())
				.map(Address::toString)
				.collect(Collectors.joining(","));
		return Assertions.assertThat(recipients);
	}

	public AbstractCharSequenceAssert<?, String> subject() throws MessagingException {
		return Assertions.assertThat(actual.getSubject());
	}

	public String bodyRaw() {
		return GreenMailUtil.getBody(actual);
	}

	public AbstractCharSequenceAssert<?, String> body() throws MessagingException {
		return Assertions.assertThat(bodyRaw());
	}

	/** @param all the HTML (including spaces) before the <a href tag you're interested in. */
	public String extractLink(String leadIn) {
		Pattern pattern = Pattern.compile(leadIn + "<a href=\"(.*?)\"");
		Matcher matcher = pattern.matcher(bodyRaw());
		if (matcher.find()) {
			return matcher.group(1);
		} else {
			throw new AssertionError("Body did not contain leadIn, leadIn=" + leadIn + " body=" + bodyRaw());
		}
	}
}
