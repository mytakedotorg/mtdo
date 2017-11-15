/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static auth.AuthModule.CREATE_EMAIL;
import static auth.AuthModule.CREATE_USERNAME;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;
import static db.Tables.CONFIRMACCOUNTLINK;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import common.Emails;
import common.RandomString;
import common.RedirectException;
import common.Text;
import common.Time;
import common.UrlEncodedPath;
import controllers.AboutUs;
import controllers.Foundation;
import db.VarChars;
import db.tables.pojos.Account;
import db.tables.records.AccountRecord;
import db.tables.records.ConfirmaccountlinkRecord;
import forms.meta.MetaField;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import forms.meta.Validator;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import org.apache.commons.mail.HtmlEmail;
import org.jooby.Request;
import org.jooby.Response;
import org.jooq.DSLContext;

public class CreateAccountForm extends MetaFormDef.HandleValid {
	/** Email links are good for this long. */
	public static final int CONFIRM_WITHIN_MINUTES = 10;

	/** Constraints on the username, https://gist.github.com/tonybruess/9405134 */
	private static final int FACEBOOK_MIN_USERNAME = 5;
	private static final int FACEBOOK_MAX_USERNAME = 50;
	private static final Pattern LOWERCASE_AND_DASH = Pattern.compile("[a-z\\d-]*");
	private static final String msg_ALLOWED_CHARACTERS = "Can only use lowercase letters, numbers, and '-'";

	public static final ImmutableSet<String> RESERVED_USERNAMES = ImmutableSet.of(
			"drafts",			// drafts
			"import",			// import from e.g. Google docs?
			"api",				// for api access
			"settings",			// for user settings
			url(Foundation.URL),	// for serving evidence
			"blog",				// for a blog
			url(AboutUs.URL),	// for us
			"legal",				// for legal attributes
			url(AuthModule.URL_login),
			url(AuthModule.URL_logout),
			url(AuthModule.URL_confirm),
			url(RedirectException.Module.URL_notFound),
			url(RedirectException.Module.URL_badRequest));

	private static final String msg_USERNAME_NOT_AVAILABLE = "Username is not available";

	static String url(String url) {
		Preconditions.checkArgument(url.startsWith("/"));
		int nextSlash = url.indexOf('/', 1);
		if (nextSlash == -1) {
			return Text.lowercase(url.substring(1));
		} else if (nextSlash == url.length() - 1) {
			return Text.lowercase(url.substring(1, nextSlash));
		} else {
			throw new IllegalArgumentException("Must be just /url/ or /url, was " + url);
		}
	}

	@Override
	public Set<MetaField<?>> fields() {
		return ImmutableSet.of(CREATE_USERNAME, CREATE_EMAIL, REDIRECT);
	}

	@Override
	protected void validate(MetaFormValidation validation) {
		// keep the fields in the reply
		validation.keepAll();

		validateUsername(validation, CREATE_USERNAME);

		Validator.strLength(0, VarChars.EMAIL).validate(validation, CREATE_EMAIL);
		Validator.email().validate(validation, CREATE_EMAIL);
	}

	static void validateUsername(MetaFormValidation validation, MetaField<String> field) {
		Validator.strLength(FACEBOOK_MIN_USERNAME, FACEBOOK_MAX_USERNAME).validate(validation, field);
		Validator.regexMustMatch(LOWERCASE_AND_DASH, msg_ALLOWED_CHARACTERS).validate(validation, field);
	}

	static void validateUsernameEmail(String username, String email, DSLContext dsl, MetaFormValidation validation) {
		Integer existingAccountId = dsl.selectFrom(ACCOUNT)
				.where(ACCOUNT.USERNAME.eq(username))
				.fetchOne(ACCOUNT.ID);
		if (existingAccountId != null) {
			validation.errorForField(CREATE_USERNAME, msg_USERNAME_NOT_AVAILABLE);
		}

		Integer accountId = dsl.selectFrom(ACCOUNT)
				.where(ACCOUNT.EMAIL.eq(email))
				.fetchOne(ACCOUNT.ID);
		if (accountId != null) {
			validation.errorForField(CREATE_EMAIL, "This email is already used by another account");
		}
	}

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String username = Text.lowercase(validation.parsed(CREATE_USERNAME));
		String email = Text.lowercase(validation.parsed(CREATE_EMAIL));
		if (RESERVED_USERNAMES.contains(username)) {
			validation.errorForField(msg_USERNAME_NOT_AVAILABLE);
		} else {
			try (DSLContext dsl = req.require(DSLContext.class)) {
				validateUsernameEmail(username, email, dsl, validation);
				if (validation.noErrors()) {
					String code = RandomString.get(req.require(Random.class), VarChars.CODE);

					// store it in the database
					ConfirmaccountlinkRecord confirm = dsl.newRecord(CONFIRMACCOUNTLINK);
					confirm.setCode(code);
					Time time = req.require(Time.class);
					confirm.setCreatedAt(time.nowTimestamp());
					confirm.setExpiresAt(time.nowTimestamp().plus(CONFIRM_WITHIN_MINUTES, TimeUnit.MINUTES));
					confirm.setRequestorIp(req.ip());
					confirm.setUsername(username);
					confirm.setEmail(email);
					confirm.insert();

					// send a confirmation email
					UrlEncodedPath path = EmailConfirmationForm.generateLink(req, validation, AuthModule.URL_confirm_account + code);
					path.param(CREATE_USERNAME, username);
					path.param(CREATE_EMAIL, email);

					String html = views.Auth.createAccountEmail.template(username, path.build()).renderToString();
					req.require(HtmlEmail.class)
							.setHtmlMsg(html)
							.setSubject("MyTake.org account confirmation")
							.addTo(email)
							.setFrom(Emails.FEEDBACK)
							.send();

					rsp.send(views.Auth.createAccountEmailSent.template(email, Emails.FEEDBACK));
					return true;
				}
			}
		}
		return false;
	}

	private static String getNullToEmpty(Request req, MetaField<String> field) {
		return req.param(field.name()).value("");
	}

	public static void confirm(String code, Request req, Response rsp) throws Throwable {
		// might be a race condition here, depending on issue #97
		//    - fetch code
		//    - create account
		//    - delete all confirmaccounts for that username and email
		// all of the above needs to be a transaction to ensure that the
		// account insertion won't hit uniqueness constraints on username
		// and email
		Time time = req.require(Time.class);
		try (DSLContext dsl = req.require(DSLContext.class)) {
			ConfirmaccountlinkRecord link = dsl.selectFrom(CONFIRMACCOUNTLINK)
					.where(CONFIRMACCOUNTLINK.CODE.eq(code))
					.fetchOne();
			MetaFormValidation validation = EmailConfirmationForm.validate(CreateAccountForm.class, req, link,
					ConfirmaccountlinkRecord::getExpiresAt, ConfirmaccountlinkRecord::getRequestorIp);
			if (validation != null) {
				String username = getNullToEmpty(req, CREATE_USERNAME);
				String email = getNullToEmpty(req, CREATE_EMAIL);
				validateUsernameEmail(username, email, dsl, validation);
				rsp.send(views.Auth.createAccountUnknown.template(validation.markup(AuthModule.URL_login)));
			} else {
				AccountRecord account = dsl.newRecord(ACCOUNT);
				account.setUsername(link.getUsername());
				account.setEmail(link.getEmail());
				account.setCreatedAt(time.nowTimestamp());
				account.setCreatedIp(req.ip());
				account.setUpdatedAt(time.nowTimestamp());
				account.setUpdatedIp(req.ip());
				account.setLastSeenAt(time.nowTimestamp());
				account.setLastSeenIp(req.ip());
				account.setLastEmailedAt(time.nowTimestamp());
				account.insert();

				// delete all other requests from that email and username
				dsl.deleteFrom(CONFIRMACCOUNTLINK)
						.where(CONFIRMACCOUNTLINK.EMAIL.eq(link.getEmail()))
						.or(CONFIRMACCOUNTLINK.USERNAME.eq(link.getUsername()))
						.execute();

				AuthUser.login(account.into(Account.class), req, rsp);
				rsp.send(views.Auth.createAccountSuccess.template(account.getUsername()));
			}
		}
	}
}
