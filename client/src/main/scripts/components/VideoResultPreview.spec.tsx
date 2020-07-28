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
import * as React from "react";
import * as renderer from "react-test-renderer";
import VideoResultPreview from "./VideoResultPreview";
import { kennedyNixon } from "../utils/testUtils";

jest.mock("./VideoResult", () => ({
  __esModule: true,
  default: "VideoResult",
}));

test("VideoResultPreview containing", () => {
  const tree = renderer
    .create(
      <VideoResultPreview
        eventHandlers={{ onPlayClick: jest.fn() }}
        searchTerm="richard"
        sortBy="Containing"
        turns={[2, 0]}
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
