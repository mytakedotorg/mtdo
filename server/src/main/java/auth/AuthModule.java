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

import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.CustomRockerModel;
import common.Emails;
import common.RedirectException;
import common.UrlEncodedPath;
import controllers.HomeFeed;
import forms.meta.MetaField;
import forms.meta.PostForm;
import java.util.Optional;
import java.util.function.Function;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Results;
import org.jooby.Route.OneArgHandler;
import org.jooby.Status;

/** The login module.  Must be before all modules that require login. */
public class AuthModule implements Jooby.Module {
	static final MetaField<String> LOGIN_REASON = MetaField.string("loginreason");
	/** Used by {@link LoginForm} and {@link CreateAccountForm}. */
	public static final MetaField<String> REDIRECT = MetaField.string("redirect");

	/** The URLs for this. */
	static final String URL_confirm = "/confirm";
	public static final String URL_confirm_login = URL_confirm + "/login/";
	public static final String URL_confirm_account = URL_confirm + "/account/";
	public static final String URL_confirm_login_sent = URL_confirm_login + "sent";
	public static final String URL_confirm_account_sent = URL_confirm_account + "sent";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// setup a JWT authenticator
		String secret = conf.getString("application.secret");
		Algorithm algorithm = Algorithm.HMAC256(secret);
		binder.bind(Algorithm.class).toInstance(algorithm);

		env.router().post(Routes.API_LOGIN, Accounts::postToApiRoute);
		PostForm.hookMultiple(env.router(), (req, validations) -> {
			Optional<AuthUser> authOpt = AuthUser.authOpt(req);
			if (authOpt.isPresent()) {
				String redirect = REDIRECT.parseOrDefault(req, "");
				if (redirect.isEmpty()) {
					return views.Auth.alreadyLoggedIn.template(authOpt.get().usernameOrEmail());
				} else {
					throw RedirectException.temporary(redirect);
				}
			} else {
				String loginReason = req.param(LOGIN_REASON.name()).value(null);
				return views.Auth.login.template(loginReason,
						validations.get(Accounts.LoginForm.class).markup(),
						validations.get(Accounts.NewForm.class).markup());
			}
		}, Accounts.LoginForm.class, Accounts.NewForm.class);
		env.router().get(URL_confirm_login_sent, redirectHomeIfAlreadyVisited(email -> views.Auth.loginEmailSent.template(email, Emails.TEAM)));
		PostForm.hook(env.router(), UsernameForm.class, (req, validation) -> {
			return views.Auth.username.template(validation.markup());
		});
		Accounts.urlCode.get(env, Accounts::confirm);

		env.router().get(Routes.LOGOUT, (req, rsp) -> {
			AuthUser.clearCookies(req, rsp);
			rsp.redirect(HomeFeed.URL);
		});
		// a missing or expired login redirects to the login page
		env.router().err(JWTVerificationException.class, (req, rsp, err) -> {
			AuthUser.clearCookies(req, rsp);
			rsp.redirect(Status.TEMPORARY_REDIRECT, UrlEncodedPath.path(Routes.LOGIN)
					.paramIfPresent(Accounts.LoginForm.EMAIL, AuthUser.usernameForError(req))
					.paramPathAndQuery(REDIRECT, req)
					.param(LOGIN_REASON, err.getCause().getMessage())
					.build());
		});
		env.router().err(Error403.class, (req, rsp, err) -> {
			Error403 cause = (Error403) err.getCause();
			if (cause.refreshMightFix) {
				rsp.header("Refresh-Might-Fix", "true");
			}
			rsp.status(Status.FORBIDDEN).send(err.getCause().getMessage());
		});
		// page for tinfoil agent to gain access
		PostForm.hook(env.router(), TinfoilLoginForm.class, (req, form) -> {
			return views.Auth.tinfoilLogin.template(form.markup());
		});
	}

	private static OneArgHandler redirectHomeIfAlreadyVisited(Function<String, CustomRockerModel> emailToTemplate) {
		return req -> {
			String email = req.ifFlash(FLASH_EMAIL).orElse(null);
			return email == null ? Results.redirect("/") : emailToTemplate.apply(email);
		};
	}

	static class Error403 extends RuntimeException {
		private static final long serialVersionUID = -6040081842021224398L;
		boolean refreshMightFix;

		Error403(String message, boolean refreshMightFix) {
			super(message);
			this.refreshMightFix = refreshMightFix;
		}
	}

	public static final String FLASH_EMAIL = "email";

}
