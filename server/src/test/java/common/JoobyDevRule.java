/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import static db.Tables.ACCOUNT;

import auth.AuthModuleHarness;
import com.diffplug.common.base.Throwing;
import com.icegreen.greenmail.util.GreenMail;
import db.tables.pojos.Account;
import io.restassured.specification.RequestSpecification;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import javax.mail.internet.MimeMessage;
import org.assertj.core.api.Assertions;
import org.jooby.Jooby;
import org.jooq.DSLContext;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.TableRecord;
import org.junit.rules.ExternalResource;

public class JoobyDevRule extends ExternalResource {
	public static JoobyDevRule empty() {
		return new JoobyDevRule(new Dev());
	}

	public static JoobyDevRule initialData() {
		return new JoobyDevRule(new Dev(), app -> {
			try (DSLContext dsl = app.dsl()) {
				InitialData.init(dsl, app.app().require(Time.class));
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

	public List<EmailAssert> waitForEmails(int count) {
		GreenMail greenmail = app.require(GreenMail.class);
		Assertions.assertThat(greenmail.waitForIncomingEmail(1)).isTrue();
		MimeMessage[] messages = greenmail.getReceivedMessages();
		Assertions.assertThat(messages).hasSize(count);
		return Arrays.stream(messages).map(EmailAssert::new).collect(Collectors.toList());
	}

	public EmailAssert waitForEmail() {
		return waitForEmails(1).get(0);
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
