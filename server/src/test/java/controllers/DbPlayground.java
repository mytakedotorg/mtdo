/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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

import static db.Tables.CONFIRMACCOUNTLINK;
import static org.assertj.core.api.Assertions.assertThat;

import common.JoobyDevRule;
import db.tables.pojos.Confirmaccountlink;
import db.tables.records.ConfirmaccountlinkRecord;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.jooq.DSLContext;
import org.jooq.Result;
import org.junit.ClassRule;
import org.junit.Test;

public class DbPlayground {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.empty();

	@Test
	public void demo() {
		// Always name the variable dsl, and use it in a try block.
		// In the jOOQ manual, they name the variable `create`, but we should always name it `dsl`
		// https://www.jooq.org/doc/3.10/manual/getting-started/the-manual/
		try (DSLContext dsl = dev.dsl()) {
			// the start of every query or modification is selecting a table
			// there are two equivalent options:
			//     A) db.Tables.EASYTRIAL
			//     B) db.tables.Easytrial.EASYTRIAL
			// always use A) with a static import, never use B), because B) collides with the POJO names (will make sense later)
			assertThat(dsl.fetch(CONFIRMACCOUNTLINK)).isEmpty();

			// for every table, there are two different classes that represent a row:
			//     A) db.tables.records.ConfirmaccountlinkRecord - has a connection to the DB, for in-place update, delete, etc.
			//     B) db.tables.pojos.Confirmaccountlink         - just a plain POJO
			ConfirmaccountlinkRecord inserted = dsl.newRecord(CONFIRMACCOUNTLINK);
			inserted.setCode("should be 44 long");
			inserted.setCreatedAt(dev.time().now());
			inserted.setExpiresAt(dev.time().now().plus(10, ChronoUnit.MINUTES));
			inserted.setRequestorIp("192.168.0.1");
			inserted.setUsername("user");
			inserted.setEmail("user@email.com");
			inserted.insert();

			ConfirmaccountlinkRecord fetched = dsl.fetchOne(CONFIRMACCOUNTLINK);
			assertThat(fetched.getEmail()).isEqualTo("user@email.com");
			assertThat(fetched.getCode()).isEqualTo("should be 44 long                           ");

			// these records maintain database connections
			fetched.setEmail("other@email.com");
			fetched.store();
			inserted.refresh();
			assertThat(inserted.getEmail()).isEqualTo("other@email.com");

			// because they have these database objects, it's a bad idea to pass
			// them into templatesm=, which is what the POJO objects are for
			Confirmaccountlink pojoFromRecord = inserted.into(Confirmaccountlink.class);
			pojoFromRecord.setEmail("another@email.com");
			ConfirmaccountlinkRecord recordFromPojo = dsl.newRecord(CONFIRMACCOUNTLINK, pojoFromRecord);
			assertThat(recordFromPojo.getEmail()).isEqualTo("another@email.com");

			// fetching multiple things works with pojos as well
			Result<ConfirmaccountlinkRecord> result = dsl.fetch(CONFIRMACCOUNTLINK);
			List<Confirmaccountlink> pojos = result.into(Confirmaccountlink.class);
			assertThat(pojos).hasSize(1);
		}
	}
}
