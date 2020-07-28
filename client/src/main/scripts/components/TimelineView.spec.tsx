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
  TimelineViewBranch,
  TimelineViewState,
  EventHandlers,
} from "./TimelineView";
import {
  documentFactLink,
  timelineItems,
  videoFactLink,
} from "../utils/testUtils";
import { SetFactHandlers } from "./TimelinePreview";

jest.mock("./TimelinePreviewContainer", () => ({
  __esModule: true,
  default: "TimelinePreviewContainer",
}));

jest.mock("./Timeline", () => ({
  __esModule: true,
  default: "Timeline",
}));

jest.mock("./TimelineRadioButtons", () => ({
  __esModule: true,
  default: "TimelineRadioButtons",
}));

const mockFn = jest.fn();

const eventHandlers: EventHandlers = {
  handleChange: mockFn,
  handleClick: mockFn,
};

const setFactHandlers: SetFactHandlers = {
  handleDocumentSetClick: mockFn,
  handleVideoSetClick: mockFn,
  handleRangeCleared: mockFn,
  handleRangeSet: mockFn,
};

const initialState: TimelineViewState = {
  factLink: null,
  loading: true,
  selectedOption: "Debates",
  timelineItems: [],
  urlValues: null,
  URLIsValid: false,
};

test("View loading", () => {
  const containerState: TimelineViewState = {
    ...initialState,
  };

  const tree = renderer
    .create(
      <TimelineViewBranch
        containerState={containerState}
        eventHandlers={eventHandlers}
        setFactHandlers={setFactHandlers}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded view", () => {
  const containerState: TimelineViewState = {
    ...initialState,
    loading: false,
  };

  const tree = renderer
    .create(
      <TimelineViewBranch
        containerState={containerState}
        eventHandlers={eventHandlers}
        setFactHandlers={setFactHandlers}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded a Document in view", () => {
  const containerState: TimelineViewState = {
    factLink: documentFactLink,
    loading: false,
    selectedOption: "Documents",
    timelineItems: timelineItems,
    urlValues: null,
    URLIsValid: true,
  };

  const tree = renderer
    .create(
      <TimelineViewBranch
        containerState={containerState}
        eventHandlers={eventHandlers}
        setFactHandlers={setFactHandlers}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded a Video in view", () => {
  const containerState: TimelineViewState = {
    factLink: videoFactLink,
    loading: false,
    selectedOption: "Debates",
    timelineItems: timelineItems,
    urlValues: null,
    URLIsValid: true,
  };

  const tree = renderer
    .create(
      <TimelineViewBranch
        containerState={containerState}
        eventHandlers={eventHandlers}
        setFactHandlers={setFactHandlers}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
