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
import * as React from "react";
import * as renderer from "react-test-renderer";
import Video from "./Video";
import { videoFactLink, videoFactFast } from "../utils/testUtils";

jest.mock("react-youtube", () => ({
  __esModule: true,
  default: "YouTube",
}));

jest.mock("./CaptionView", () => ({
  __esModule: true,
  default: "CaptionView",
}));

jest.mock("./DropDown", () => ({
  __esModule: true,
  default: "DropDown",
}));

const mockFn = jest.fn();

test("Video", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFactFast}
        videoFactHash={videoFactLink.hash}
        onSetClick={mockFn}
        className={"video__inner-container"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Video with highlights", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFactFast}
        videoFactHash={videoFactLink.hash}
        onSetClick={mockFn}
        className={"video__inner-container"}
        clipRange={[0, 3]} // Test range can't go outside of videoFact.transcript range
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
