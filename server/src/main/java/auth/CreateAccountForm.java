/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package auth;

import static db.Tables.ACCOUNT;
import static db.Tables.CONFIRMACCOUNTLINK;

import com.google.common.collect.ImmutableSet;
import common.RandomString;
import common.Text;
import common.Time;
import db.VarChars;
import db.tables.records.ConfirmaccountlinkRecord;
import forms.meta.MetaField;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import forms.meta.Validator;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import org.jooby.Request;
import org.jooby.Response;
import org.jooq.DSLContext;

public class CreateAccountForm extends MetaFormDef.HandleValid {
	public static final ImmutableSet<String> RESERVED_USERNAMES = ImmutableSet.of(
			"drafts",	// drafts
			"import",	// import from e.g. Google docs?
			"api",		// for api access
			"settings",	// for user settings
			"evidence"	// for service evidence
	);

	public static final int CONFIRM_WITHIN_MINUTES = 10;

	public static final MetaField<String> USERNAME = MetaField.string("username");
	public static final MetaField<String> EMAIL = MetaField.string("email");

	@Override
	public Set<MetaField<?>> fields() {
		return ImmutableSet.of(USERNAME, EMAIL);
	}

	/** https://gist.github.com/tonybruess/9405134 */
	private static final int FACEBOOK_MIN_USERNAME = 5;
	private static final int FACEBOOK_MAX_USERNAME = 50;
	private static final Pattern LOWERCASE_AND_DASH = Pattern.compile("[a-z\\d-]*");

	@Override
	protected void validate(MetaFormValidation validation) {
		// keep the fields in the reply
		validation.keepAll();

		Validator.strLength(FACEBOOK_MIN_USERNAME, FACEBOOK_MAX_USERNAME).validate(validation, USERNAME);
		Validator.regexMustMatch(LOWERCASE_AND_DASH, "Can only use lowercase letters, numbers, and '-'").validate(validation, USERNAME);

		Validator.strLength(0, VarChars.EMAIL).validate(validation, EMAIL);
		Validator.email().validate(validation, EMAIL);
	}

	private static final String USERNAME_NOT_AVAILABLE = "Username is not available";

	@Override
	public boolean handleSuccessful(MetaFormValidation validation, Request req, Response rsp) throws Throwable {
		String username = Text.lowercase(validation.parsed(USERNAME));
		String email = Text.lowercase(validation.parsed(EMAIL));
		if (RESERVED_USERNAMES.contains(username)) {
			validation.errorForField(USERNAME_NOT_AVAILABLE);
		} else {
			try (DSLContext dsl = req.require(DSLContext.class)) {
				Integer existingAccountId = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.USERNAME.eq(username))
						.fetchOne(ACCOUNT.ID);
				if (existingAccountId != null) {
					validation.errorForField(USERNAME, USERNAME_NOT_AVAILABLE);
				}

				Integer accountId = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.EMAIL.eq(email))
						.fetchOne(ACCOUNT.ID);
				if (accountId != null) {
					validation.errorForField(EMAIL, "This email is already used by another account.");
				}

				if (validation.noErrors()) {
					ConfirmaccountlinkRecord confirm = dsl.newRecord(CONFIRMACCOUNTLINK);
					confirm.setCode(RandomString.get(req.require(Random.class), VarChars.CODE));
					Time time = req.require(Time.class);
					confirm.setCreatedAt(time.nowTimestamp());
					confirm.setExpiresAt(time.nowTimestamp().plus(CONFIRM_WITHIN_MINUTES, TimeUnit.MINUTES));
					confirm.setRequestorIp(req.ip());
					confirm.setUsername(username);
					confirm.setEmail(email);
					confirm.insert();

					// TODO: send email
					return true;
				}
			}
		}
		return false;
	}

	public static void confirm(String code, Request req, Response rsp) throws Throwable {
		try (DSLContext dsl = req.require(DSLContext.class)) {
			//			ProtouserRecord protouser = dsl.selectFrom(PROTOUSER)
			//					.where(PROTOUSER.CODE.eq(code))
			//					.fetchOne();
			//			if (protouser == null) {
			//				rsp.send(views.Auth.unknownRegistration.template());
			//			} else {
			//				// create the new user
			//				DpUserRecord user = new DpUserRecord();
			//				user.setEmail(protouser.getEmail());
			//				user.setIssuper(false);
			//				user.setIsbeta(false);
			//				user.setPwhash(protouser.getPassword());
			//				user.attach(dsl.configuration());
			//				user.insert();
			//				DDpUser userModel = user.into(DDpUser.class);
			//
			//				UserinfoRecord info = new UserinfoRecord();
			//				info.setUserId(user.getId());
			//				info.setFirstname(protouser.getFirstname());
			//				info.setLastname(protouser.getLastname());
			//				info.attach(dsl.configuration());
			//				info.insert();
			//
			//				// and delete the proto
			//				protouser.delete();
			//
			//				// log them in and let them know they're logged in
			//				AuthUser.login(userModel, req, rsp);
			//				rsp.send(views.Auth.confirmed.template(protouser.getFirstname()));
			//			}
		}
	}
}
