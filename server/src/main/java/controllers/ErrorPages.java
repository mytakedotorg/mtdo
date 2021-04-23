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
package controllers;

import auth.AuthUser;
import com.diffplug.common.base.StringPrinter;
import com.diffplug.common.base.Throwing;
import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import common.EmailSender;
import common.Emails;
import common.RandomString;
import common.Time;
import common.UserException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.jetbrains.annotations.Nullable;
import org.jooby.Env;
import org.jooby.Err;
import org.jooby.Jooby;
import org.jooby.Registry;
import org.jooby.Request;
import org.jooby.Results;
import org.jooby.Route;
import org.jooby.Status;
import org.jooq.DSLContext;

public class ErrorPages implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		// when crawlers request a head, we don't care
		env.router().head("*", req -> Results.with(Status.METHOD_NOT_ALLOWED));
		// when users request non-existent URLs, we don't care
		env.router().err(404, (req, rsp, err) -> {
			String message = err.getMessage();
			// built-in message that we want to ignore
			if (message.startsWith("Not Found(404): ")) {
				message = null;
			}
			rsp.send(views.ErrorPages.errorcode404.template(req.rawPath(), message));
		});
		// when users request non-existent methods on routes, we don't care (iff they're not logged-in)
		env.router().err(405, (req, rsp, err) -> {
			Optional<AuthUser> authOpt = AuthUser.authOpt(req);
			if (authOpt.isPresent()) {
				rsp.send(views.ErrorPages.internalError.template(null, emailSupportAndGetCode("Internal 405", req, err)));
			} else {
				String message = null;
				rsp.send(views.ErrorPages.errorcode404.template(req.rawPath(), message));
			}
		});
		// we throw UserExceptions on purpose in our controllers to send nice error messages
		env.router().err(UserException.class, (req, rsp, err) -> {
			UserException userException = ((UserException) err.getCause());
			rsp.send(views.ErrorPages.userError.template(userException.getMessage()));
		});
		// unexpected errors send an email to us and show a code to the user
		env.router().err((req, rsp, err) -> {
			rsp.send(views.ErrorPages.internalError.template(null, emailSupportAndGetCode("Internal", req, err)));
		});
	}

	private static final int ERROR_CODE_LENGTH = 20;

	/** Emails our support team and returns an error code to the user, which the support team can match with the logs. */
	public static String emailSupportAndGetCode(String kind, Request req, Err err) {
		AuthUser auth = AuthUser.authOpt(req).orElse(null);
		// elide wrapper Err
		Throwable cause = Optional.ofNullable(err.getCause()).orElse(err);

		Route route = req.route();
		ImmutableMap<String, Object> envData = ImmutableMap.of(
				"auth", Optional.ofNullable(auth),
				"route",
				ImmutableMap.<String, Object> builder()
						.put("method", route.method())
						.put("path", route.path())
						.put("path vars", route.vars())
						.put("pattern", route.pattern())
						.put("name", route.name())
						.put("attributes", route.attributes()).build(),
				"params", req.params().toMap(),
				"locals", req.attributes(),
				"headers", req.headers());
		ImmutableMap<String, Object> total = ImmutableMap.of(
				"rootCause", Throwables.getRootCause(err),
				"env", envData,
				"stacktrace", Throwables.getStackTraceAsString(cause));
		String debug = StringPrinter.buildString(printer -> {
			total.forEach((key, value) -> {
				dump(printer, key, value);
			});
		});

		return emailSupportAndGetCode(req.require(SecureRandom.class), req.require(EmailSender.class), auth, kind, debug, err);
	}

	/** A scheduled job, which will report errors to our team if it fails. */
	public static class ScheduledJob {
		protected final SecureRandom random;
		protected final EmailSender email;
		protected final DSLContext dsl;
		protected final Time time;

		protected ScheduledJob(SecureRandom random, EmailSender email, DSLContext dsl, Time time) {
			this.random = random;
			this.email = email;
			this.dsl = dsl;
			this.time = time;
		}

		/** For testing only. */
		protected ScheduledJob(Registry reg) {
			this(reg.require(SecureRandom.class), reg.require(EmailSender.class), reg.require(DSLContext.class), reg.require(Time.class));
		}

		protected void run(Throwing.Consumer<Map<String, Object>> toRun) {
			Map<String, Object> debugValues = new HashMap<>();
			try {
				toRun.accept(debugValues);
			} catch (Throwable err) {
				String kind = this.getClass().getName();
				Throwable cause = Optional.ofNullable(err.getCause()).orElse(err);
				ImmutableMap<String, Object> total = ImmutableMap.of(
						"scheduled", kind,
						"debug", debugValues,
						"stacktrace", Throwables.getStackTraceAsString(cause));
				String debug = StringPrinter.buildString(printer -> {
					total.forEach((key, value) -> {
						dump(printer, key, value);
					});
				});
				AuthUser auth = null;
				emailSupportAndGetCode(random, email, auth, kind, debug, err);
			}
		}
	}

	private static String emailSupportAndGetCode(SecureRandom random, EmailSender email, @Nullable AuthUser auth, String kind, String debug, Throwable err) {
		String errorCode = RandomString.get(random, ERROR_CODE_LENGTH).replace('-', '0').replace('_', '1');

		System.err.println(kind + " error " + errorCode);
		System.err.println(debug);

		String errorFor = auth != null ? auth.username() : "anon";
		String subject = errorFor + ": " + kind + " error " + errorCode + " " + Throwables.getRootCause(err);
		email.send(htmlEmail -> htmlEmail
				.setHtmlMsg(views.ErrorPages.internalErrorEmail.template(errorCode, debug).renderToString())
				.setSubject(subject)
				.addTo(Emails.TECH.email(), Emails.TECH.name()));
		return errorCode;
	}

	@SuppressWarnings({"rawtypes", "unchecked"})
	private static void dump(StringPrinter printer, String indent, Object value) {
		if (indent.startsWith("env.locals._permanent.")) {
			return;
		}
		if (value instanceof Map) {
			Map map = (Map) value;
			map.forEach((key, child) -> {
				dump(printer, indent + "." + key, child);
			});
		} else {
			if (indent.contains("password")) {
				value = "REDACTED";
			}
			printer.println("  " + indent + "=" + value);
		}
	}
}
