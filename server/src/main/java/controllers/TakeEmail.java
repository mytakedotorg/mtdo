/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
