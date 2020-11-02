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
import { TurnFinder } from "./searchUtils";

test("turnfinder-corner-case", () => {
  const finder = new TurnFinder("farm");
  const withResults = finder.findResults(
    "Uh - Senator Kennedy, during your brief speech a few minutes ago you mentioned farm surpluses."
  );
  expect(withResults.foundOffsets.length).toBe(1);
  const expanded = withResults.expandBy(1);

  expect(expanded.length).toBe(1);
  expect(expanded[0].cut[0]).toBe(0);
  // to find these, look at "col" value in bottom-right of VSCode.  Might be worth making a nice test harness
  // to make it easier to read than a number, dunno
  expect(expanded[0].cut[1]).toBe(94);
});

test("turnfinder-negative-clause", () => {
  const finder = new TurnFinder("wall, -wall street");
  const withResults = finder.findResults(
    "We're going to build a wall around wall street."
  );

  expect(withResults.foundOffsets.length).toBe(1);

  const highlightedOffset = withResults.foundOffsets[0];
  expect(highlightedOffset[0]).toBe(23);
  expect(highlightedOffset[1]).toBe(27);
  expect(highlightedOffset[2]).toBe(0);
});

test("turnfinder-negative-clause-2", () => {
  const finder = new TurnFinder("wall, -border wall");
  const withResults = finder.findResults(
    "We're going to build a wall around a border wall."
  );

  expect(withResults.foundOffsets.length).toBe(1);

  const highlightedOffset = withResults.foundOffsets[0];
  expect(highlightedOffset[0]).toBe(23);
  expect(highlightedOffset[1]).toBe(27);
  expect(highlightedOffset[2]).toBe(0);
});

test("turnfinder-negative-clause-3", () => {
  const finder = new TurnFinder("states, -united states of america");
  const withResults = finder.findResults(
    "Several states compose the united states of america. The United States of America comprises several states."
  );

  expect(withResults.foundOffsets.length).toBe(2);

  const firstOffset = withResults.foundOffsets[0];
  expect(firstOffset[0]).toBe(8);
  expect(firstOffset[1]).toBe(14);
  expect(firstOffset[2]).toBe(0);

  const secondOffset = withResults.foundOffsets[1];
  expect(secondOffset[0]).toBe(100);
  expect(secondOffset[1]).toBe(106);
  expect(secondOffset[2]).toBe(0);
});
