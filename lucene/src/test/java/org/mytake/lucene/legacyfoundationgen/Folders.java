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
package org.mytake.lucene.legacyfoundationgen;

import java.nio.file.Path;
import java.nio.file.Paths;

public class Folders {
	public static Path SRC_DOCUMENT = Paths.get("src/main/resources/document");
	public static Path SRC_PRESIDENTIAL_DEBATES = Paths.get("../presidential-debates");
	public static Path DST_FOUNDATION_RESOURCES = Paths.get("../foundation/src/main/resources");
	public static Path DST_FOUNDATION_DATA = DST_FOUNDATION_RESOURCES.resolve("foundation-data");
}
