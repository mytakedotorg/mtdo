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
import { search } from "../search/search";
import * as fs from "fs";
import { getNumberOfHitsPerYear } from "../search/NGramViewer";

// This test writes out `ngramDataGen.json`. When the production dataset
// changes, then that .json file will change. It's messy, because here is
// how deploying a new rev of a factset works:
// 1) deploy the new factset to prod
// 2) now, when this test runs, `ngramDataGen.json` will be a little different
// 3) commit that change
// 4) deploy the new homepage to production
// That feedback loop isn't great, but deploying new facts is already messy,
// we'll just add this to the manual checklist for now.
test("generateSearchData", async () => {
  var searches: NgramData = {};
  for (let searchQuery of SEARCHES) {
    const searchResult = await search(searchQuery);
    searches[searchQuery] = await getNumberOfHitsPerYear(searchResult);
  }
  fs.writeFileSync(
    "src/main/scripts/components/homepage/ngramDataGen.json",
    JSON.stringify(searches),
    "utf8"
  );
});
