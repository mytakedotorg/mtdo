/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
