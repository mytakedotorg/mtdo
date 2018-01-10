/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;

import java.util.Map;

import javax.activation.DataSource;

import auth.AuthUser;
import com.google.inject.Binder;
import com.jsoniter.any.Any;
import com.typesafe.config.Config;
import common.EmailSender;
import java2ts.EmailSelf;
import java2ts.Routes;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Status;
import org.jooq.DSLContext;

public class TakeEmail implements Jooby.Module {
	@Override
	public void configure(Env env, Config conf, Binder binder) throws Throwable {
		env.router().post(Routes.API_EMAIL_SELF, req -> {
			AuthUser user = AuthUser.auth(req);
			String email;
			try (DSLContext dsl = req.require(DSLContext.class)) {
				email = dsl.selectFrom(ACCOUNT)
						.where(ACCOUNT.ID.eq(user.id()))
						.fetchOne(ACCOUNT.EMAIL);
			}
			EmailSelf emailSelf = req.body(EmailSelf.class);
			Map<String, Any> map = emailSelf.cidMap.asMap();
			
			req.require(EmailSender.class).send(htmlEmail -> {
				htmlEmail.addTo(email);
				htmlEmail.setSubject(emailSelf.subject);
				htmlEmail.setHtmlMsg(emailSelf.body);
				for (String key : map.keySet()) {
					htmlEmail.embed((DataSource) map.get(key), key.toString());
//					htmlEmail.embed((DataSource) map.get(key), key.toString(), key.toString());
				}
			});
			return Status.OK;
		});
	}
}
