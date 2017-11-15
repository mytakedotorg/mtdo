/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
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
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Status;

/** The login module.  Must be before all modules that require login. */
public class AuthModule implements Jooby.Module {
	/** Used by {@link LoginForm} and {@link CreateAccountForm}. */
	public static final MetaField<String> REDIRECT = MetaField.string("redirect");
	/** Used by {@link LoginForm} only. */
	public static final MetaField<String> LOGIN_EMAIL = MetaField.string("loginemail");
	/** Used by {@link CreateAccountForm} only. */
	public static final MetaField<String> CREATE_USERNAME = MetaField.string("createuser");
	public static final MetaField<String> CREATE_EMAIL = MetaField.string("createemail");

	/** The URLs for this. */
	public static final String URL_login = "/login";
	public static final String URL_logout = "/logout";
	static final String URL_confirm = "/confirm";
	public static final String URL_confirm_login = URL_confirm + "/login/";
	public static final String URL_confirm_account = URL_confirm + "/account/";

	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// setup a JWT authenticator
		String secret = conf.getString("application.secret");
		Algorithm algorithm = Algorithm.HMAC256(secret);
		binder.bind(Algorithm.class).toInstance(algorithm);

		env.router().get(URL_login, req -> {
			Optional<AuthUser> userOpt = AuthUser.authOpt(req);
			if (userOpt.isPresent()) {
				return views.Auth.alreadyLoggedIn.template(userOpt.get().username());
			} else {
				// initialize the form parameters
				MetaFormValidation login = MetaFormValidation.empty(LoginForm.class)
						.initIfPresent(req, REDIRECT, LOGIN_EMAIL);
				MetaFormValidation createAccount = MetaFormValidation.empty(CreateAccountForm.class)
						.initIfPresent(req, REDIRECT, CREATE_USERNAME, CREATE_EMAIL);
				return views.Auth.login.template(login.markup(URL_login), createAccount.markup(URL_login));
			}
		});
		env.router().post(URL_login, (req, rsp) -> {
			List<MetaFormValidation> validations = MetaFormDef.HandleValid.validation(req, rsp, LoginForm.class, CreateAccountForm.class);
			if (!validations.isEmpty()) {
				MetaFormValidation login = validations.get(0);
				MetaFormValidation createAccount = validations.get(1);
				rsp.send(views.Auth.login.template(login.markup(URL_login), createAccount.markup(URL_login)));
			}
		});
		env.router().get(URL_confirm_account + ":code", (req, rsp) -> {
			CreateAccountForm.confirm(req.param("code").value(), req, rsp);
		});
		env.router().get(URL_confirm_login + ":code", (req, rsp) -> {
			LoginForm.confirm(req.param("code").value(), req, rsp);
		});
		env.router().get(URL_logout, (req, rsp) -> {
			rsp.clearCookie(AuthUser.LOGIN_COOKIE);
			rsp.clearCookie(AuthUser.LOGIN_UI_COOKIE);
			rsp.redirect(HomeFeed.URL);
		});
		// a missing or expired login redirects to the login page
		env.router().err(JWTVerificationException.class, (req, rsp, err) -> {
			rsp.clearCookie(AuthUser.LOGIN_COOKIE);
			rsp.clearCookie(AuthUser.LOGIN_UI_COOKIE);
			rsp.redirect(Status.FORBIDDEN, UrlEncodedPath.path(URL_login)
					.paramIfPresent(LOGIN_EMAIL, AuthUser.usernameForError(req))
					.paramPathAndQuery(REDIRECT, req)
					.build());
		});
	}
}
