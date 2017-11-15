/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytake/mytake/graphs/contributors
 */
package common;

import static db.Tables.ACCOUNT;
import static db.Tables.TAKEPUBLISHED;

import com.google.common.io.Resources;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.inject.Binder;
import com.typesafe.config.Config;
import db.Tables;
import db.tables.records.AccountRecord;
import db.tables.records.TakepublishedRecord;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.jooby.Env;
import org.jooby.Jooby;
import org.jooq.DSLContext;

/** This is for setting the initial data for the case that the database is empty. */
public class InitialData {
	/** If the database is empty, initializes with some data. */
	public static class Module implements Jooby.Module {
		@Override
		public void configure(Env env, Config conf, Binder binder) throws Throwable {
			env.onStart(registry -> {
				try (DSLContext dsl = registry.require(DSLContext.class)) {
					int numAccounts = dsl.fetchCount(Tables.ACCOUNT);
					if (numAccounts == 0) {
						init(dsl, registry.require(Time.class));
					}
				}
			});
		}
	}

	public static void init(DSLContext dsl, Time time) throws Exception {
		int sampleUser = usernameEmail(dsl, time, "sample", "sample@email.com");
		take(dsl, time, sampleUser, "Why it's so hard to have peace");
		take(dsl, time, sampleUser, "Does a law mean what it says, or what it meant?");
		take(dsl, time, sampleUser, "Don't worry, we'll protect the Constitution for you!");
	}

	static int usernameEmail(DSLContext dsl, Time time, String username, String email) {
		AccountRecord record = dsl.newRecord(ACCOUNT);
		record.setUsername(username);
		record.setEmail(email);
		record.setCreatedAt(time.nowTimestamp());
		record.setCreatedIp(IP);
		record.setUpdatedAt(time.nowTimestamp());
		record.setUpdatedIp(IP);
		record.setLastSeenAt(time.nowTimestamp());
		record.setLastSeenIp(IP);
		record.setLastEmailedAt(time.nowTimestamp());
		record.insert();
		return record.getId();
	}

	static int take(DSLContext dsl, Time time, int user, String title) throws IOException {
		TakepublishedRecord record = dsl.newRecord(TAKEPUBLISHED);
		record.setUserId(user);
		record.setTitle(title);
		String slugified = Text.slugify(title);
		record.setTitleSlug(slugified);

		String jsonData = Resources.toString(Resources.getResource("initialdata/" + slugified + ".json"), StandardCharsets.UTF_8);
		JsonElement blocks = new JsonParser().parse(jsonData);
		record.setBlocks(blocks);

		record.setPublishedAt(time.nowTimestamp());
		record.setPublishedIp(IP);
		record.insert();
		return record.getId();
	}

	private static final String IP = "127.0.0.1";
}
