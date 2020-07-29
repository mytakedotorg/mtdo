/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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

import static auth.AuthModule.ACCEPT_TERMS;
import static auth.AuthModule.CREATE_EMAIL;
import static auth.AuthModule.CREATE_USERNAME;
import static auth.AuthModule.REDIRECT;
import static db.Tables.ACCOUNT;
import static db.Tables.CONFIRMACCOUNTLINK;

import common.DbMisc;
import common.EmailSender;
import common.IpGetter;
import common.Mods;
import common.RedirectException;
import common.Text;
import common.Time;
import common.UrlEncodedPath;
import common.UrlRandomCode;
import controllers.HomeFeed;
import db.VarChars;
import db.tables.pojos.Account;
import db.tables.records.AccountRecord;
import db.tables.records.ConfirmaccountlinkRecord;
import forms.api.FormValidation;
import forms.api.FormValidation.Sensitive;
import forms.meta.PostForm;
import forms.meta.TypedFormDef;
import forms.meta.Validator;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import java2ts.Routes;
import org.jooby.Request;
import org.jooby.Response;
import org.jooq.DSLContext;

public class CreateAccountForm extends PostForm<CreateAccountForm> {
	/** Email links are good for this long. */
	public static final int CONFIRM_WITHIN_MINUTES = 10;

	/** Constraints on the username, https://gist.github.com/tonybruess/9405134 */
	private static final int FACEBOOK_MIN_USERNAME = 5;
	private static final int FACEBOOK_MAX_USERNAME = 50;
	private static final Pattern LOWERCASE_AND_DASH = Pattern.compile("[a-z\\d-]*");

	private static final String msg_ALLOWED_CHARACTERS = "Can only use lowercase letters, numbers, and '-'";
	private static final String msg_USERNAME_NOT_AVAILABLE = "Username is not available";

	public CreateAccountForm() {
		super(Routes.LOGIN, ACCEPT_TERMS, CREATE_USERNAME, CREATE_EMAIL, REDIRECT);
	}

	@Override
	protected ValidateResult<CreateAccountForm> validate(Request req, Sensitive<CreateAccountForm> form) {
		FormValidation.Builder<CreateAccountForm> retry = form.keep(CREATE_USERNAME, CREATE_EMAIL, REDIRECT);
		if (!form.valuePresent(ACCEPT_TERMS) || !form.value(ACCEPT_TERMS)) {
			return retry.addError(ACCEPT_TERMS, "Must accept the terms to create an account");
		}
		String username = Text.lowercase(form.value(CREATE_USERNAME));
		String email = Text.lowercase(form.value(CREATE_EMAIL));

		validateUsernameFormat(username, retry);
		if (ReservedUsernames.isReserved(username)) {
			return retry.addError(CREATE_USERNAME, msg_USERNAME_NOT_AVAILABLE);
		}

		ConfirmaccountlinkRecord confirm;
		try (DSLContext dsl = req.require(DSLContext.class)) {
			validateUsernameEmailUnique(username, email, dsl, retry);
			if (!retry.noErrors()) {
				return retry;
			}

			Time.AddableTimestamp now = req.require(Time.class).nowTimestamp();
			String ip = req.require(IpGetter.class).ip(req);
			confirm = urlCode.createRecord(req, dsl, now, ip);
			confirm.setExpiresAt(now.plus(CONFIRM_WITHIN_MINUTES, TimeUnit.MINUTES));
			confirm.setUsername(username);
			confirm.setEmail(email);
			confirm.insert();
		}

		// send a confirmation email
		UrlEncodedPath path = urlCode.recordToUrl(req, confirm);
		if (form.valuePresent(REDIRECT)) {
			path.param(REDIRECT, form.value(REDIRECT));
		}
		path.param(CREATE_USERNAME, username);
		path.param(CREATE_EMAIL, email);

		req.require(EmailSender.class).send(htmlEmail -> htmlEmail
				.setHtmlMsg(views.Auth.createAccountEmail.template(username, path.build()).renderToString())
				.setSubject("MyTake.org account confirmation")
				.addTo(email));

		req.flash(AuthModule.FLASH_EMAIL, form.value(CREATE_EMAIL));
		return ValidateResult.redirect(AuthModule.URL_confirm_account_sent);
	}

	static void validateUsernameFormat(String username, FormValidation.Builder<CreateAccountForm> retry) {
		// username validation
		Validator.strLength(FACEBOOK_MIN_USERNAME, FACEBOOK_MAX_USERNAME).validate(retry, CREATE_USERNAME);
		Validator.regexMustMatch(LOWERCASE_AND_DASH, msg_ALLOWED_CHARACTERS).validate(retry, CREATE_USERNAME);
		// email validation
		Validator.email().validate(retry, CREATE_EMAIL);
		Validator.strLength(0, VarChars.EMAIL).validate(retry, CREATE_EMAIL);
	}

	private static void validateUsernameEmailUnique(String username, String email, DSLContext dsl, FormValidation.Builder<CreateAccountForm> form) {
		if (DbMisc.fetchOne(dsl, ACCOUNT.USERNAME, username, ACCOUNT.ID) != null) {
			form.addError(CREATE_USERNAME, msg_USERNAME_NOT_AVAILABLE);
		}
		if (DbMisc.fetchOne(dsl, ACCOUNT.EMAIL, email, ACCOUNT.ID) != null) {
			form.addError(CREATE_EMAIL, msg_EMAIL_ALREADY_USED);
		}
	}

	private static final String msg_EMAIL_ALREADY_USED = "This email is already used by another account";

	public static void confirm(Request req, Response rsp) throws Throwable {
		String username = CREATE_USERNAME.parseOrDefault(req, "");
		String email = CREATE_EMAIL.parseOrDefault(req, "");

		Optional<AuthUser> userOpt = AuthUser.authOpt(req);
		Time.AddableTimestamp now = req.require(Time.class).nowTimestamp();
		String ip = req.require(IpGetter.class).ip(req);
		DbMisc.transaction(req, dsl -> {
			ConfirmaccountlinkRecord record = urlCode.tryGetRecord(req, dsl);

			FormValidation.Builder<CreateAccountForm> form = FormValidation.emptyBuilder(TypedFormDef.create(CreateAccountForm.class));
			form.set(CREATE_USERNAME, username);
			form.set(CREATE_EMAIL, email);
			form.set(REDIRECT, REDIRECT.parseOrDefault(req, HomeFeed.URL));
			validateUsernameEmailUnique(username, email, dsl, form);

			// if the record doesn't match the url, then there was tampering, and we just bail
			if (record != null && (!record.getUsername().equals(username) || !record.getEmail().equals(email))) {
				throw RedirectException.notFoundError();
			}

			if (record == null) {
				if (userOpt.isPresent() && userOpt.get().username().equals(username)) {
					// they're already logged-in
					rsp.send(views.Auth.alreadyConfirmed.template(username));
				} else {
					// clear the user's existing cookies if they're clicking a "confirm" link for someone else
					if (userOpt.isPresent() && !userOpt.get().username().equals(username)) {
						AuthUser.clearCookies(req, rsp);
					}

					boolean emailAlreadyUsed = msg_EMAIL_ALREADY_USED.equals(form.error(CREATE_EMAIL));
					if (emailAlreadyUsed) {
						// since the email is already used, they probably just need to login
						UrlEncodedPath path = UrlEncodedPath.path(Routes.LOGIN)
								.param(AuthModule.LOGIN_EMAIL, email)
								.param(AuthModule.LOGIN_REASON, "Your account is already confirmed, you can login.")
								.paramIfPresent(AuthModule.LOGIN_REASON, req)
								.paramIfPresent(AuthModule.REDIRECT, req);
						rsp.redirect(path.build());
					} else {
						// we'll let them try to create their account again
						rsp.send(views.Auth.createAccountUnknown.template(form.build().markup()));
					}
				}
			} else {
				AccountRecord account = dsl.newRecord(ACCOUNT);
				account.setUsername(record.getUsername());
				account.setEmail(record.getEmail());
				account.setCreatedAt(now);
				account.setCreatedIp(ip);
				account.setUpdatedAt(now);
				account.setUpdatedIp(ip);
				account.setLastSeenAt(now);
				account.setLastSeenIp(ip);
				account.setLastEmailedAt(now);
				account.insert();

				// delete all other requests from that email and username
				dsl.deleteFrom(CONFIRMACCOUNTLINK)
						.where(CONFIRMACCOUNTLINK.EMAIL.eq(record.getEmail()))
						.or(CONFIRMACCOUNTLINK.USERNAME.eq(record.getUsername()))
						.execute();

				AuthUser.login(account.into(Account.class), req).forEach(rsp::cookie);
				rsp.send(views.Auth.createAccountSuccess.template(account.getUsername()));
			}
		});
		req.require(Mods.class).send(emailHtml -> emailHtml
				.setSubject("New user " + username)
				.setMsg(Mods.table(
						"Username", username,
						"Email", email,
						"Link", "https://mytake.org/" + username)));
	}

	static final UrlRandomCode<ConfirmaccountlinkRecord> urlCode = new UrlRandomCode<>(AuthModule.URL_confirm_account, CONFIRMACCOUNTLINK.CODE, CONFIRMACCOUNTLINK.CREATED_AT, CONFIRMACCOUNTLINK.REQUESTOR_IP);
}
