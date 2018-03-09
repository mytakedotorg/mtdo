/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package auth;

import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.UrlEncodedPath;
import controllers.HomeFeed;
import forms.meta.MetaField;
import forms.meta.MetaFormDef;
import forms.meta.MetaFormValidation;
import java.util.List;
import java.util.Optional;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Status;

/** The login module.  Must be before all modules that require login. */
public class AuthModule implements Jooby.Module {
	static final MetaField<String> LOGIN_REASON = MetaField.string("loginreason");
	/** Used by {@link LoginForm} and {@link CreateAccountForm}. */
	public static final MetaField<String> REDIRECT = MetaField.string("redirect");
	/** Used by {@link LoginForm} only. */
	public static final MetaField<String> LOGIN_EMAIL = MetaField.string("loginemail");
	/** Used by {@link CreateAccountForm} only. */
	public static final MetaField<String> CREATE_USERNAME = MetaField.string("createuser");
	public static final MetaField<String> CREATE_EMAIL = MetaField.string("createemail");
	public static final MetaField<Boolean> ACCEPT_TERMS = MetaField.bool("acceptterms");

	/** The URLs for this. */
	static final String URL_confirm = "/confirm";
	public static final String URL_confirm_login = URL_confirm + "/login/";
	public static final String URL_confirm_account = URL_confirm + "/account/";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// setup a JWT authenticator
		String secret = conf.getString("application.secret");
		Algorithm algorithm = Algorithm.HMAC256(secret);
		binder.bind(Algorithm.class).toInstance(algorithm);

		env.router().get(Routes.LOGIN, req -> {
			Optional<AuthUser> userOpt = AuthUser.authOpt(req);
			if (userOpt.isPresent()) {
				return views.Auth.alreadyLoggedIn.template(userOpt.get().username());
			} else {
				// we might have gotten here from a JWTVerificationException, and we want to tell the user why
				String loginReason = req.param(LOGIN_REASON.name()).value(null);
				// initialize the form parameters
				MetaFormValidation login = MetaFormValidation.empty(LoginForm.class)
						.initIfPresent(req, REDIRECT, LOGIN_EMAIL);
				MetaFormValidation createAccount = MetaFormValidation.empty(CreateAccountForm.class)
						.initIfPresent(req, REDIRECT, CREATE_USERNAME, CREATE_EMAIL);
				return views.Auth.login.template(loginReason, login.markup(Routes.LOGIN), createAccount.markup(Routes.LOGIN));
			}
		});
		env.router().post(Routes.LOGIN, (req, rsp) -> {
			List<MetaFormValidation> validations = MetaFormDef.HandleValid.validation(req, rsp, LoginForm.class, CreateAccountForm.class);
			if (!validations.isEmpty()) {
				String loginReason = null;
				MetaFormValidation login = validations.get(0);
				MetaFormValidation createAccount = validations.get(1);
				rsp.send(views.Auth.login.template(loginReason, login.markup(Routes.LOGIN), createAccount.markup(Routes.LOGIN)));
			}
		});
		env.router().get(URL_confirm_account + ":code", (req, rsp) -> {
			CreateAccountForm.confirm(req.param("code").value(), req, rsp);
		});
		env.router().get(URL_confirm_login + ":code", (req, rsp) -> {
			LoginForm.confirm(req.param("code").value(), req, rsp);
		});
		env.router().get(Routes.LOGOUT, (req, rsp) -> {
			AuthUser.clearCookies(rsp);
			rsp.redirect(HomeFeed.URL);
		});
		// a missing or expired login redirects to the login page
		env.router().err(JWTVerificationException.class, (req, rsp, err) -> {
			AuthUser.clearCookies(rsp);
			rsp.redirect(Status.TEMPORARY_REDIRECT, UrlEncodedPath.path(Routes.LOGIN)
					.paramIfPresent(LOGIN_EMAIL, AuthUser.usernameForError(req))
					.paramPathAndQuery(REDIRECT, req)
					.param(LOGIN_REASON, err.getCause().getMessage())
					.build());
		});
		// page for tinfoil agent to gain access
		env.router().get(TinfoilLoginForm.URL, req -> {
			MetaFormValidation login = MetaFormValidation.empty(TinfoilLoginForm.class);
			return views.Auth.tinfoilLogin.template(login.markup(TinfoilLoginForm.URL));
		});
		env.router().post(TinfoilLoginForm.URL, (req, rsp) -> {
			List<MetaFormValidation> validations = MetaFormDef.HandleValid.validation(req, rsp, TinfoilLoginForm.class);
			if (!validations.isEmpty()) {
				MetaFormValidation login = validations.get(0);
				rsp.send(views.Auth.tinfoilLogin.template(login.markup(TinfoilLoginForm.URL)));
			}
		});
	}
}
