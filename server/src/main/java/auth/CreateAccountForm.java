/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static db.Tables.ACCOUNT;
import static db.Tables.CONFIRMACCOUNTLINK;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import common.Emails;
import common.RandomString;
import common.Text;
import common.Time;
import common.UrlEncodedPath;
import db.VarChars;
import db.tables.Account;
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
			"drafts",	// drafts
			"import",	// import from e.g. Google docs?
			"api",		// for api access
			"settings",	// for user settings
			"evidence",	// for service evidence
			"aboutus",  // for us
			"legal",    // for legal attributes
			url(AuthModule.URL_login),
			url(AuthModule.URL_logout),
			url(AuthModule.URL_confirm));

	private static final String msg_USERNAME_NOT_AVAILABLE = "Username is not available";

	static String url(String url) {
		Preconditions.checkArgument(url.startsWith("/"));
		int nextSlash = url.indexOf('/', 1);
		if (nextSlash == -1) {
			return url.substring(1);
		} else if (nextSlash == url.length() - 1) {
			return url.substring(1, nextSlash);
		} else {
			throw new IllegalArgumentException("Must be just /url/ or /url, was " + url);
		}
	}

	public static final MetaField<String> USERNAME = MetaField.string("username");
	public static final MetaField<String> EMAIL = MetaField.string("email");
	public static final MetaField<String> REDIRECT = MetaField.string("redirect");

	@Override
	public Set<MetaField<?>> fields() {
		return ImmutableSet.of(USERNAME, EMAIL, REDIRECT);
	}

	@Override
	protected void validate(MetaFormValidation validation) {
		// keep the fields in the reply
		validation.keepAll();

		validateUsername(validation, USERNAME);

		Validator.strLength(0, VarChars.EMAIL).validate(validation, EMAIL);
		Validator.email().validate(validation, EMAIL);
	}

	static void validateUsername(MetaFormValidation validation, MetaField<String> field) {
		Validator.strLength(FACEBOOK_MIN_USERNAME, FACEBOOK_MAX_USERNAME).validate(validation, field);
		Validator.regexMustMatch(LOWERCASE_AND_DASH, msg_ALLOWED_CHARACTERS).validate(validation, field);
	}

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String username = Text.lowercase(validation.parsed(USERNAME));
		String email = Text.lowercase(validation.parsed(EMAIL));
		if (RESERVED_USERNAMES.contains(username)) {
			validation.errorForField(msg_USERNAME_NOT_AVAILABLE);
		} else {
			try (DSLContext dsl = req.require(DSLContext.class)) {
				Integer existingAccountId = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.USERNAME.eq(username))
						.fetchOne(ACCOUNT.ID);
				if (existingAccountId != null) {
					validation.errorForField(USERNAME, msg_USERNAME_NOT_AVAILABLE);
				}

				Integer accountId = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.EMAIL.eq(email))
						.fetchOne(ACCOUNT.ID);
				if (accountId != null) {
					validation.errorForField(EMAIL, "This email is already used by another account");
				}

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
					UrlEncodedPath root = UrlEncodedPath.absolutePath(req, AuthModule.URL_confirm + code);
					String redirect = validation.parsed(REDIRECT);
					if (!redirect.isEmpty()) {
						root.param(AuthModule.LOGIN_PARAM_ORIGINAL, redirect);
					}
					String html = views.Auth.emailConfirm.template(username, root.build()).renderToString();
					req.require(HtmlEmail.class)
							.setHtmlMsg(html)
							.setSubject("MyTake.org account confirmation")
							.addTo(email)
							.setFrom(Emails.FEEDBACK)
							.send();

					rsp.send(views.Auth.confirmationSent.template(email, Emails.FEEDBACK));
					return true;
				}
			}
		}
		return false;
	}

	public static void confirm(String code, Request req, Response rsp) throws Throwable {
		// might be a race condition here, depending on issue #97
		//    - fetch code
		//    - create account
		//    - delete all confirmaccounts for that username and email
		// all of the above needs to be a transaction to ensure that the
		// account insertion won't hit uniqueness constraints on username
		// and email
		try (DSLContext dsl = req.require(DSLContext.class)) {
			ConfirmaccountlinkRecord record = dsl.selectFrom(CONFIRMACCOUNTLINK)
					.where(CONFIRMACCOUNTLINK.CODE.eq(code))
					.fetchOne();
			if (record == null) {
				// - maybe expired a long time ago and got cleaned
				// - maybe already clicked
				// - maybe somebody else sniped the username
				rsp.send(views.Auth.confirmUnknown.template());
			} else {
				Time time = req.require(Time.class);
				if (time.nowTimestamp().after(record.getExpiresAt())) {
					// it expired, but the username and email are still available,
					// so we'll prepopulate the link
					String createAccountLink = UrlEncodedPath.path(AuthModule.URL_login)
							.param(AuthModule.LOGIN_PARAM_EMAIL, record.getEmail())
							.param(AuthModule.LOGIN_PARAM_USERNAME, record.getUsername())
							.build();
					record.delete();
					rsp.send(views.Auth.confirmExpired.template(createAccountLink));
				} else {
					AccountRecord account = dsl.newRecord(ACCOUNT);
					account.setUsername(record.getUsername());
					account.setEmail(record.getEmail());
					account.setCreatedAt(time.nowTimestamp());
					account.setCreatedIp(req.ip());
					account.setUpdatedAt(time.nowTimestamp());
					account.setUpdatedIp(req.ip());
					account.setLastSeenAt(time.nowTimestamp());
					account.setUpdatedIp(req.ip());
					account.setLastEmailedAt(time.nowTimestamp());
					record.insert();

					// delete all other requests from that email and username
					dsl.deleteFrom(CONFIRMACCOUNTLINK)
							.where(CONFIRMACCOUNTLINK.EMAIL.eq(record.getEmail()))
							.or(CONFIRMACCOUNTLINK.USERNAME.eq(record.getUsername()))
							.execute();

					AuthUser.login(account.into(Account.class), req, rsp);
					rsp.send(views.Auth.confirmSuccess.template(account.getUsername()));
				}
			}
		}
	}
}
