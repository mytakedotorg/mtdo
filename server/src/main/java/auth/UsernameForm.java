/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020-2021 MyTake.org, Inc.
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
package auth;

import static db.Tables.ACCOUNT;

import common.DbMisc;
import db.tables.records.AccountRecord;
import forms.api.FormValidation;
import forms.meta.MetaField;
import forms.meta.PostForm;
import forms.meta.Validator;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java2ts.Routes;
import org.jooby.Request;
import org.jooq.DSLContext;

public class UsernameForm extends PostForm<UsernameForm> {
	public static final MetaField<String> USERNAME = MetaField.string("username");
	public static final MetaField<Boolean> ACCEPT_TERMS = MetaField.bool("terms");

	public UsernameForm() {
		super(Routes.USERNAME, USERNAME, ACCEPT_TERMS, AuthModule.REDIRECT);
	}

	/** Populates the initial values for the given form. */
	@Override
	protected FormValidation<UsernameForm> initialGet(Request req, Map<String, String> params) {
		FormValidation.Builder<UsernameForm> builder = FormValidation.emptyBuilder(this);
		builder.set(AuthModule.REDIRECT, AuthModule.REDIRECT.parseOrDefault(req, REDIRECT_DEFAULT));
		ensureNoChange(builder, req);
		return builder.build();
	}

	private static void ensureNoChange(FormValidation.Builder<UsernameForm> builder, Request req) {
		// set the initial username
		AuthUser auth = AuthUser.auth(req);
		if (!auth.confirmed) {
			builder.addError(USERNAME, "You must first confirm your email address. Check your email!").build();
			return;
		}
		String alreadyHasUsername;
		if (auth.username() != null) {
			alreadyHasUsername = auth.username();
		} else {
			try (DSLContext dsl = req.require(DSLContext.class)) {
				alreadyHasUsername = DbMisc.fetchOne(dsl, ACCOUNT.ID, auth.id(), ACCOUNT.USERNAME);
			}
		}
		if (alreadyHasUsername != null) {
			builder.addError(USERNAME, "You already have a username.");
			builder.set(USERNAME, alreadyHasUsername);
		}
	}

	@Override
	protected ValidateResult<UsernameForm> validate(Request req, FormValidation.Sensitive<UsernameForm> fromUser) {
		FormValidation.Builder<UsernameForm> retry = fromUser.keepAll();
		if (!retry.valuePresent(ACCEPT_TERMS) || !retry.value(ACCEPT_TERMS)) {
			return retry.set(ACCEPT_TERMS, false).addError(ACCEPT_TERMS, "Must accept the terms to claim a username");
		}
		ensureNoChange(retry, req);
		AuthUser auth = AuthUser.auth(req);
		validateFormat(retry);
		if (retry.noErrors()) {
			try (DSLContext dsl = req.require(DSLContext.class)) {
				String typoHard = validateTypoHardened(dsl, retry);
				if (retry.noErrors()) {
					dsl.update(ACCOUNT)
							.set(ACCOUNT.USERNAME, retry.value(USERNAME))
							.set(ACCOUNT.USERNAME_TYPOHARD, typoHard)
							// ACCOUNT.USERNAME.isNull() functions to make this atomic
							.where(ACCOUNT.ID.eq(auth.id()).and(ACCOUNT.USERNAME.isNull()))
							.execute();
					String redirect = AuthModule.REDIRECT.parseOrDefault(req, REDIRECT_DEFAULT);
					AccountRecord account = DbMisc.fetchOne(dsl, ACCOUNT.ID, auth.id());
					return ValidateResult.redirect(redirect, AuthUser.login(account, req));
				}
			}
		}
		return retry;
	}

	private static final String REDIRECT_DEFAULT = "/";

	/** Constraints on the username, https://gist.github.com/tonybruess/9405134 */
	private static final int FACEBOOK_MIN_USERNAME = 5;
	private static final int FACEBOOK_MAX_USERNAME = 50;
	private static final Pattern LOWERCASE_AND_DASH = Pattern.compile("[a-z\\d-]*");

	private static final String msg_ALLOWED_CHARACTERS = "Can only use lowercase letters, numbers, and '-'";
	private static final String msg_USERNAME_ALREADY_TAKEN = "Already taken";
	private static final String msg_USERNAME_TOO_SIMILAR_TO = "Too similar to existing user ";

	static void validateFormat(FormValidation.Builder<UsernameForm> retry) {
		// username validation
		Validator.strLength(FACEBOOK_MIN_USERNAME, FACEBOOK_MAX_USERNAME).validate(retry, USERNAME);
		Validator.regexMustMatch(LOWERCASE_AND_DASH, msg_ALLOWED_CHARACTERS).validate(retry, USERNAME);
	}

	static String validateTypoHardened(DSLContext dsl, FormValidation.Builder<UsernameForm> retry) {
		String username = retry.value(USERNAME);
		String typoHard = typoHarden(username);
		String conflictUsername = DbMisc.fetchOne(dsl, ACCOUNT.USERNAME_TYPOHARD, typoHard, ACCOUNT.USERNAME);
		if (conflictUsername != null) {
			if (conflictUsername.equals(username)) {
				retry.addError(USERNAME, msg_USERNAME_ALREADY_TAKEN);
			} else {
				retry.addError(USERNAME, msg_USERNAME_TOO_SIMILAR_TO + conflictUsername);
			}
		}
		return typoHard;
	}

	static String typoHarden(String username) {
		String substituted = username
				.toLowerCase(Locale.US)
				.replace("-", "")   // george-washington
				.replace('a', '4')  // alex4nder-hamilton
				.replace('b', '8')  // 8en-franklin
				.replace('d', '6')  // james ma6ison
				.replace('e', '3')  // jam3s madison
				.replace("f", "ph") // benjamin-phranklin
				.replace('g', '9')  // 9eor9e-washington
				.replace('h', '4')  // george-was4ington 
				.replace('i', '1')  // george-wash1ngton
				.replace('l', '1')  // a1exander-ham1lton
				.replace('o', '0')  // alexander-hamilt0n
				.replace('q', '9')  // 9uincy-adams
				.replace('s', '5')  // quincy-adam5
				.replace('t', '1')  // alexander-hamil1on
				.replace("u", "v")  // george-uuashington
				.replace("vv", "w") // george-vvashington
				.replace('z', '2'); // 2an2ibar
		// remove duplicated letters 
		StringBuilder builder = new StringBuilder(substituted.length());
		char lastChar = '\0';
		for (int i = 0; i < substituted.length(); ++i) {
			char newChar = substituted.charAt(i);
			if (newChar != lastChar) {
				lastChar = newChar;
				builder.append(lastChar);
			}
		}
		return builder.toString();
	}
}
