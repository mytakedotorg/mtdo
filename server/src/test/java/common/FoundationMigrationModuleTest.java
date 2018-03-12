/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import static db.Tables.ACCOUNT;
import static db.Tables.FOUNDATION_REV;

import db.tables.pojos.Account;
import db.tables.records.TakepublishedRecord;
import db.tables.records.TakerevisionRecord;
import java.util.List;
import java.util.Set;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.ListAssert;
import org.jooby.Jooby;
import org.jooby.jdbc.Jdbc;
import org.jooby.jooq.jOOQ;
import org.jooq.DSLContext;
import org.junit.ClassRule;
import org.junit.Test;

public class FoundationMigrationModuleTest {
	static class App extends Jooby {
		{
			use(new DevTime.Module());
			use(new Dev.EmbeddedPostgresModule());
			use(new Jdbc());
			use(new jOOQ());
		}
	}

	@ClassRule
	public static JoobyDevRule dev = new JoobyDevRule(new App());

	@Test
	public void testReplace() throws Exception {
		try (DSLContext dsl = dev.dsl()) {
			InitialData.init(dsl, dev.time());
			TakeBuilder blocks = TakeBuilder.builder().video("-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=", 1, 2);

			Account account = dev.fetchRecord(ACCOUNT, ACCOUNT.EMAIL, "samples@email.com").into(Account.class);

			TakerevisionRecord revision = InitialData.draft(dsl, dev.time(), account.getId(), "Title", blocks);
			TakepublishedRecord published = InitialData.take(dsl, dev.time(), account.getId(), "Title", blocks);

			assertFoundationRev(dsl).containsExactly(1);
			Set<Integer> changed = FoundationMigrationModule.migrate(dsl, dev.time());
			assertFoundationRev(dsl).containsExactly(1, 2);
			revision.refresh();
			published.refresh();

			Assertions.assertThat(changed).containsExactly(published.getId());
			String expected = "[{'kind': 'video', 'range': [1, 2], 'videoId': 'mz0GDKCE-RL1swa5u7ZugyQScNJMfpo3_FwSju6JLlo='}]".replace('\'', '"');
			Assertions.assertThat(revision.getBlocks()).isEqualTo(expected);
			Assertions.assertThat(published.getBlocks()).isEqualTo(expected);
		}
	}

	private ListAssert<Integer> assertFoundationRev(DSLContext dsl) {
		List<Integer> versionsBeforeMigrate = dsl.selectFrom(FOUNDATION_REV).fetch(FOUNDATION_REV.VERSION);
		return Assertions.assertThat(versionsBeforeMigrate);
	}
}
