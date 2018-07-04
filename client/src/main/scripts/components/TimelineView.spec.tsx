import * as React from "react";
import * as renderer from "react-test-renderer";
import {
  TimelineViewBranch,
  TimelineViewState,
  EventHandlers
} from "./TimelineView";
import {
  documentFactLink,
  timelineItems,
  videoFactLink
} from "../utils/testUtils";
import { SetFactHandlers } from "./TimelinePreview";
import { Foundation } from "../java2ts/Foundation";

jest.mock("./TimelinePreviewContainer", () => ({
  default: "TimelinePreviewContainer"
}));

jest.mock("./Timeline", () => ({
  default: "Timeline"
}));

jest.mock("./TimelineRadioButtons", () => ({
  default: "TimelineRadioButtons"
}));

const mockFn = jest.fn();

const eventHandlers: EventHandlers = {
  handleChange: mockFn,
  handleClick: mockFn
};

const setFactHandlers: SetFactHandlers = {
  handleDocumentSetClick: mockFn,
  handleVideoSetClick: mockFn,
  handleRangeCleared: mockFn,
  handleRangeSet: mockFn
};

const initialState: TimelineViewState = {
  factLink: null,
  loading: true,
  selectedOption: "Debates",
  timelineItems: [],
  urlValues: null,
  URLIsValid: false
};

test("View loading", () => {
  const containerState: TimelineViewState = {
    ...initialState
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
    loading: false
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
    URLIsValid: true
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
    URLIsValid: true
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
