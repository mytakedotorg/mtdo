/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import { TurnFinder } from "./searchFunc";

test("turnfinder-corner-case", () => {
  let finder = new TurnFinder("farm");
  let withResults = finder.findResults(
    "Uh - Senator Kennedy, during your brief speech a few minutes ago you mentioned farm surpluses."
  );
  expect(withResults.foundOffsets.length).toBe(1);
  let expanded = withResults.expandBy(1);

  expect(expanded.length).toBe(1);
  expect(expanded[0].cut[0]).toBe(0);
  // to find these, look at "col" value in bottom-right of VSCode.  Might be worth making a nice test harness
  // to make it easier to read than a number, dunno
  expect(expanded[0].cut[1]).toBe(94);
});
