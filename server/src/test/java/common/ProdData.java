/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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

import com.google.common.base.StandardSystemProperty;
import java.io.File;
import java.util.List;
import java.util.stream.Collectors;
import org.jooby.Jooby;
import org.jooq.DSLContext;
import org.jooq.ResultQuery;

public class ProdData {
	/** Prints the sql, then prints the result of the execution. */
	static void action(DSLContext dsl) {
		ResultQuery<?> query = usersThatStartWithN(dsl);
		System.out.println("--- SQL ---");
		System.out.println(query.getSQL());
		System.out.println("--- RESULT ---");
		System.out.println(query.fetch());
	}

	private static ResultQuery<?> usersThatStartWithN(DSLContext dsl) {
		return dsl.selectFrom(ACCOUNT)
				.where(ACCOUNT.USERNAME.startsWith("n"));
	}

	/** Gets the only file in the ~/Downloads/backups folder, and gets its path as mounted by the docker contianer. */
	public static String backupFile() {
		String userHome = StandardSystemProperty.USER_HOME.value();
		String backupsPath = userHome + "/Downloads";
		File[] children = new File(backupsPath).listFiles();
		if (children == null) {
			throw new IllegalStateException("~/Downloads should have one .pgdump file, instead is empty");
		}
		List<File> filtered = java.util.Arrays.stream(children)
				.filter(file -> file.getName().endsWith(".pgdump"))
				.collect(Collectors.toList());
		if (filtered.size() != 1) {
			throw new IllegalStateException("~/Downloads should have one .pgdump file, has " + filtered);
		}
		return "/Downloads/" + filtered.get(0).getName();
	}

	/** Removes all password hashes from the backup archive, then dumps the result to disk. */
	public static void main(String[] args) {
		CleanPostgresModule postgresModule = CleanPostgresModule.loadFromBackup(backupFile());
		Jooby app = new Jooby();
		app.use(postgresModule);
		Prod.commonDb(app);
		app.start("server.join=false");
		try (DSLContext dsl = app.require(DSLContext.class)) {
			action(dsl);
			//cleanPasswords(dsl);
			postgresModule.pgDump("no-passwords");
		} finally {
			app.stop();
		}
	}
}
