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
import { SEARCHES, NgramData } from "./AnimatedHeading";
import { search, SearchMode } from "../search/search";
import * as fs from "fs";
import { getNumberOfHitsPerYear } from "../search/NGramViewer";

// This isn't really a "test", it's just a typescript-module runner.
// It needs runDev to be up and running, and if it is, then it will output
// a new ngramDataGen.json
test("generateSearchData", async () => {
  try {
    var searches: NgramData = {};
    for (let searchQuery of SEARCHES) {
      const searchResult = await search(
        searchQuery,
        SearchMode.Containing,
        "http://localhost:8080"
      );
      searches[searchQuery] = await getNumberOfHitsPerYear(searchResult);
    }
    fs.writeFileSync(
      "src/main/scripts/components/homepage/ngramDataGen.json",
      JSON.stringify(searches),
      "utf8"
    );
  } catch (err) {
    // suppress failures
  }
});
