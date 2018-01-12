/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package controllers;

import static db.Tables.ACCOUNT;

import auth.AuthUser;
import com.google.common.base.Preconditions;
import com.google.inject.Binder;
import com.jsoniter.any.Any;
import com.typesafe.config.Config;
import common.EmailSender;
import java.util.Base64;
import java.util.Map;
import java2ts.EmailSelf;
import java2ts.Routes;
import javax.mail.util.ByteArrayDataSource;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooby.Status;
import org.jooq.DSLContext;

public class TakeEmail implements Jooby.Module {
	private static final String DATA_PREFIX = "data:image/png;base64,";

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

			req.require(EmailSender.class).send(htmlEmail -> {
				String emailBody = emailSelf.body;
				htmlEmail.addTo(email);
				htmlEmail.setSubject(emailSelf.subject);
				// convert data uri's to attachments for Gmail
				Map<String, Any> map = emailSelf.cidMap.asMap();
				for (String key : map.keySet()) {
					// convert data uri to binary
					String valueBase64WithHeader = map.get(key).toString();
					Preconditions.checkArgument(valueBase64WithHeader.startsWith(DATA_PREFIX));
					String valueBase64 = valueBase64WithHeader.substring(DATA_PREFIX.length());
					byte[] valueBinary = Base64.getDecoder().decode(valueBase64);
					// attach to email
					ByteArrayDataSource data = new ByteArrayDataSource(valueBinary, "image/png");
					String cid = htmlEmail.embed(data, key);
					// replace img src with the contentid generated when attached
					String nextEmailBody = emailBody.replace("<img src=\"cid:" + key + "\"", "<img src=\"cid:" + cid + "\"");
					Preconditions.checkArgument(!nextEmailBody.equals(emailBody), "Failed to replace src URL for img %s", key);
					emailBody = nextEmailBody;
				}
				htmlEmail.setHtmlMsg(emailBody);
			});
			return Status.OK;
		});
	}
}
