/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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

	private String bodyRaw() {
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
