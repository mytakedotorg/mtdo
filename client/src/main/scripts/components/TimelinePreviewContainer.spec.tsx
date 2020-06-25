/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
import {
  TimelinePreviewContainerBranch,
  TimelinePreviewContainerProps,
  TimelinePreviewContainerState,
} from "./TimelinePreviewContainer";
import {
  documentFactLink,
  documentNodes,
  videoFactFast,
  videoFactLink,
} from "../utils/testUtils";

jest.mock("./TimelinePreview", () => ({
  default: "TimelinePreview",
}));

const setFactHandlers = {
  handleDocumentSetClick: jest.fn(),
  handleVideoSetClick: jest.fn(),
  handleRangeSet: jest.fn(),
  handleRangeCleared: jest.fn(),
};

const containerProps = {
  factLink: documentFactLink,
};

test("Preview loading", () => {
  const containerState: TimelinePreviewContainerState = {
    loading: true,
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Document Preview", () => {
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    nodes: documentNodes,
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Document Preview with highlights", () => {
  const extendedProps: TimelinePreviewContainerProps = {
    ...containerProps,
    offset: 248,
    ranges: {
      highlightedRange: [11, 53],
      viewRange: [0, 218],
    },
    setFactHandlers: setFactHandlers,
  };
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    nodes: documentNodes,
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={extendedProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Video Preview", () => {
  const videoProps: TimelinePreviewContainerProps = {
    factLink: videoFactLink,
    setFactHandlers: setFactHandlers,
  };
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    videoFact: videoFactFast,
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={videoProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
