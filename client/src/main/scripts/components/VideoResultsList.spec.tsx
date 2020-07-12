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
import * as renderer from "react-test-renderer";
import { VideoResultsList, VideoResultsListProps } from "./VideoResultsList";
import { searchResultsMap } from "./VideoResultsLoader.spec";
import * as videoFactHashMap from "../utils/videoFactHashMap.json";
import { processFacts } from "../utils/factResults";
import { VideoFactHashMap } from "../utils/databaseAPI";

test("VideoResultsList social security", () => {
  const resultsList: VideoResultsListProps = {
    searchTerm: "social security",
    factTurns: processFacts(
      searchResultsMap!,
      (videoFactHashMap as unknown) as VideoFactHashMap[]
    ),
  };
  const tree = renderer
    .create(new VideoResultsList(resultsList).render())
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("VideoResultsList no results", () => {
  const resultsList: VideoResultsListProps = {
    searchTerm: "gibberish",
    factTurns: [],
  };
  const tree = renderer
    .create(new VideoResultsList(resultsList).render())
    .toJSON();
  expect(tree).toMatchSnapshot();
});
