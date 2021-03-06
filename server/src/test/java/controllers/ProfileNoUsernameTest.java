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
package controllers;

import common.InitialData;
import common.JoobyDevRule;
import common.Snapshot;
import org.junit.ClassRule;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ProfileNoUsernameTest {
	@ClassRule
	public static JoobyDevRule dev = JoobyDevRule.initialData();

	@Test
	public void noUsername() {
		Snapshot.match("naked", dev.givenEmail(InitialData.EMAIL_NOUSERNAME).get("/my"));
		Snapshot.match("profile", dev.givenEmail(InitialData.EMAIL_NOUSERNAME).get("/my?tab=profile"));
		Snapshot.match("bookmarks", dev.givenEmail(InitialData.EMAIL_NOUSERNAME).get("/my?tab=bookmarks"));
	}
}
