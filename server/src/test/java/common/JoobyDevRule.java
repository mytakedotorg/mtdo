/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
package common;

import static db.Tables.ACCOUNT;

import auth.AuthModuleHarness;
import com.diffplug.common.base.Errors;
import com.diffplug.common.base.Throwing;
import com.icegreen.greenmail.util.GreenMail;
import db.tables.pojos.Account;
import io.restassured.specification.RequestSpecification;
import java.util.HashMap;
import java.util.Map;
import javax.mail.Message.RecipientType;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import org.jooby.Jooby;
import org.jooq.DSLContext;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.TableRecord;
import org.junit.rules.ExternalResource;

public class JoobyDevRule extends ExternalResource {
	public static JoobyDevRule empty() {
		return new JoobyDevRule(Dev.unitTest());
	}

	public static JoobyDevRule initialData() {
		return new JoobyDevRule(Dev.unitTest(), app -> {
			try (DSLContext dsl = app.dsl()) {
				InitialData.init(dsl, app.app().require(Time.class));
			}
		});
	}

	/** To prevent noise from moderator emails. */
	public static JoobyDevRule initialDataNoMods() {
		return new JoobyDevRule(Dev.unitTest(), app -> {
			try (DSLContext dsl = app.dsl()) {
				InitialData.init(dsl, app.app().require(Time.class));
				dsl.deleteFrom(db.Tables.MODERATOR).execute();
			}
		});
	}

	public JoobyDevRule(Jooby app) {
		this(app, unused -> {});
	}

	public JoobyDevRule(Jooby app, Throwing.Consumer<JoobyDevRule> init) {
		this.app = app;
		this.init = init;
	}

	private final Jooby app;
	private final Throwing.Consumer<JoobyDevRule> init;

	@Override
	public void before() throws Throwable {
		app.start("server.join=false");
		init.accept(this);
	}

	@Override
	public void after() {
		app.stop();
	}

	public DevTime time() {
		return (DevTime) app.require(Time.class);
	}

	public DSLContext dsl() {
		return app.require(DSLContext.class);
	}

	public <R extends TableRecord<R>> void insertRecord(R record) {
		try (DSLContext dsl = dsl()) {
			dsl.executeInsert(record);
		}
	}

	public <K, R extends TableRecord<R>> R fetchRecord(Table<R> table, TableField<R, K> keyField, K key) {
		try (DSLContext dsl = dsl()) {
			return dsl.selectFrom(table).where(keyField.eq(key)).fetchOne();
		}
	}

	/** The count is the number of *sent* emails - one email sent to two people is still just one email. */
	public Map<String, EmailAssert> waitForEmails(int numberSent) {
		GreenMail greenmail = app.require(GreenMail.class);
		try {
			boolean allArrived = greenmail.waitForIncomingEmail(numberSent);
			MimeMessage[] messages = greenmail.getReceivedMessages();
			if (!allArrived && messages.length != numberSent) {
				String errorMsg = "Expected " + numberSent + " new messages, but had " + messages.length;
				for (MimeMessage message : messages) {
					errorMsg += "\n    " + emailFor(message) + ": " + Errors.rethrow().get(() -> message.getSubject());
				}
				throw new AssertionError(errorMsg);
			} else {
				Map<String, EmailAssert> map = new AssertGetsMap<>();
				for (MimeMessage message : messages) {
					map.put(emailFor(message), new EmailAssert(message));
				}
				return map;
			}
		} finally {
			Errors.rethrow().run(greenmail::purgeEmailFromAllMailboxes);
		}
	}

	static class AssertGetsMap<K, V> extends HashMap<K, V> {
		private static final long serialVersionUID = -5150352310651793881L;

		@Override
		public V get(Object key) {
			V result = super.get(key);
			if (result == null) {
				throw new AssertionError("Looking for '" + key + "' but only had " + super.keySet());
			} else {
				return result;
			}
		}
	}

	private static String emailFor(MimeMessage message) {
		try {
			InternetAddress addr = (InternetAddress) message.getRecipients(RecipientType.TO)[0];
			return addr.getAddress();
		} catch (MessagingException e) {
			throw Errors.asRuntime(e);
		}
	}

	public EmailAssert waitForEmail() {
		return waitForEmails(1).values().iterator().next();
	}

	public Jooby app() {
		return app;
	}

	/** Returns a request with cookies set for the given username. */
	public RequestSpecification givenUser(String username) {
		Account account = fetchRecord(ACCOUNT, ACCOUNT.USERNAME, username).into(Account.class);
		return AuthModuleHarness.givenUser(app, account);
	}
}
