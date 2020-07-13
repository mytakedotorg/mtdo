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
import * as React from "react";
import { Search } from "../java2ts/Search";
import { createHashMap } from "../utils/factResults";
import { isEqual } from "lodash";

test("VideoResultsLoader sorts results", () => {
  expect(isEqual(searchResultsMap, expectedSortedResults)).toBeTruthy();
});

// test("VideoResultsLoader sorts turns", () => {
//   for (const turns of searchResultsMap!.values()) {
//     expect(searchResultsMap).toBesorted() // this doesn't exist, but add it
//   }
// });

const searchResults: Search.FactResultList = {
  facts: [
    { turn: 102, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 106, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 116, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 26, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 101, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 98, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 13, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 81, hash: "ct8Gai5QMo1gqK6c5h3SBTZIpMnG_7jMcKCgpMucSWo=" },
    { turn: 54, hash: "9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=" },
    { turn: 52, hash: "9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=" },
    { turn: 31, hash: "9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=" },
    { turn: 108, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 59, hash: "QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=" },
    { turn: 79, hash: "ct8Gai5QMo1gqK6c5h3SBTZIpMnG_7jMcKCgpMucSWo=" },
    { turn: 104, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 78, hash: "ct8Gai5QMo1gqK6c5h3SBTZIpMnG_7jMcKCgpMucSWo=" },
    { turn: 60, hash: "QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=" },
    { turn: 50, hash: "9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=" },
    { turn: 99, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 21, hash: "ybl8jZ3k0SWZZGC_OtRYLl0zGRuNlm42qaEu7wxFvfo=" },
    { turn: 112, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 38, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
    { turn: 61, hash: "QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=" },
    { turn: 11, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 80, hash: "ct8Gai5QMo1gqK6c5h3SBTZIpMnG_7jMcKCgpMucSWo=" },
    { turn: 56, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
    { turn: 24, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 57, hash: "QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=" },
    { turn: 88, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 56, hash: "QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=" },
    { turn: 82, hash: "ct8Gai5QMo1gqK6c5h3SBTZIpMnG_7jMcKCgpMucSWo=" },
    { turn: 50, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 63, hash: "QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=" },
    { turn: 9, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 23, hash: "ybl8jZ3k0SWZZGC_OtRYLl0zGRuNlm42qaEu7wxFvfo=" },
    { turn: 39, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
    { turn: 49, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
    { turn: 70, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
    { turn: 110, hash: "1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=" },
    { turn: 78, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 7, hash: "ybl8jZ3k0SWZZGC_OtRYLl0zGRuNlm42qaEu7wxFvfo=" },
    { turn: 110, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 72, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
    { turn: 19, hash: "ybl8jZ3k0SWZZGC_OtRYLl0zGRuNlm42qaEu7wxFvfo=" },
    { turn: 9, hash: "Lz55WCSZ9K3GVqgrtTV09n_zdlymUPVajCnkPhaqOuY=" },
    { turn: 34, hash: "orUj1nSeeyotMbBe4RH-beskEDldBQD7reYiKbhhx5A=" },
    { turn: 133, hash: "ybl8jZ3k0SWZZGC_OtRYLl0zGRuNlm42qaEu7wxFvfo=" },
    { turn: 51, hash: "9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=" },
    { turn: 20, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 56, hash: "9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=" },
    { turn: 132, hash: "vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=" },
    { turn: 1, hash: "SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=" },
  ],
};

export const searchResultsMap = createHashMap(searchResults);

const expectedSortedResults = new Map();
expectedSortedResults.set("1fPLAadIV8L4-PjT6yF63KyEjfieDpZbGfGNiQN3Q7c=", [
  102,
  106,
  101,
  98,
  108,
  104,
  99,
  110,
]);
expectedSortedResults.set("vrhLapmIbWECYassLC2Umf7Z16fusYgWWGhTP7KgIYU=", [
  116,
  26,
  13,
  112,
  11,
  24,
  88,
  50,
  9,
  78,
  110,
  20,
  132,
]);
expectedSortedResults.set("ct8Gai5QMo1gqK6c5h3SBTZIpMnG_7jMcKCgpMucSWo=", [
  81,
  79,
  78,
  80,
  82,
]);
expectedSortedResults.set("9Ei2jkqRyt5vw9_0BnQ4vXeXgpm8ODgreLgFS7mEInM=", [
  54,
  52,
  31,
  50,
  51,
  56,
]);
expectedSortedResults.set("QBMMV1cOwoY18eVsm5JE8INSvKwGkHzr3WfWAach_Aw=", [
  59,
  60,
  61,
  57,
  56,
  63,
]);
expectedSortedResults.set("ybl8jZ3k0SWZZGC_OtRYLl0zGRuNlm42qaEu7wxFvfo=", [
  21,
  23,
  7,
  19,
  133,
]);
expectedSortedResults.set("SbhZ_6P0LahGQXyGaIQHFXB9YkoigsHApb-SDCNZk-4=", [
  38,
  56,
  39,
  49,
  70,
  72,
  1,
]);
expectedSortedResults.set("Lz55WCSZ9K3GVqgrtTV09n_zdlymUPVajCnkPhaqOuY=", [9]);
expectedSortedResults.set("orUj1nSeeyotMbBe4RH-beskEDldBQD7reYiKbhhx5A=", [34]);
