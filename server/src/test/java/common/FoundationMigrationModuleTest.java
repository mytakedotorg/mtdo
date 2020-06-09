/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import static db.Tables.ACCOUNT;
import static db.Tables.FOUNDATION_REV;

import com.google.common.primitives.Ints;
import db.tables.pojos.Account;
import db.tables.records.TakepublishedRecord;
import db.tables.records.TakerevisionRecord;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;
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
			use(CleanPostgresModule.prePopulatedSchema());
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
			TakeBuilder blocks = TakeBuilder.builder().video("dcrl-fARztw49lA2wg5xsM8GUZdkmK0deLZ-EuRGW2M=", 1, 2);

			Account account = dev.fetchRecord(ACCOUNT, ACCOUNT.EMAIL, "samples@email.com").into(Account.class);

			TakerevisionRecord revision = InitialData.draft(dsl, dev.time(), account.getId(), "Title", blocks);
			TakepublishedRecord published = InitialData.take(dsl, dev.time(), account.getId(), "Title", blocks);

			assertFoundationRev(dsl).containsExactly(1);
			Set<Integer> changed = FoundationMigrationModule.migrate(dsl, dev.time());
			assertFoundationRev(dsl).containsExactlyElementsOf(
					Ints.asList(IntStream.range(1, FoundationMigrationModule.maxId() + 1).toArray()));
			revision.refresh();
			published.refresh();

			Assertions.assertThat(changed).containsExactly(published.getId());
			String expected = "[{'kind': 'video', 'range': [1, 2], 'videoId': 'iqFs0S6PjvdMBxmS4HKEgbv9fukhg7dfjrVVHPx8mgE='}]".replace('\'', '"');
			Assertions.assertThat(revision.getBlocks().data()).isEqualTo(expected);
			Assertions.assertThat(published.getBlocks().data()).isEqualTo(expected);
		}
	}

	private ListAssert<Integer> assertFoundationRev(DSLContext dsl) {
		List<Integer> versionsBeforeMigrate = dsl.selectFrom(FOUNDATION_REV).fetch(FOUNDATION_REV.VERSION);
		return Assertions.assertThat(versionsBeforeMigrate);
	}
}
