import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  TimelineViewBranch,
  TimelineViewState,
  EventHandlers
} from "./TimelineView";
import { documentFactLink, timelineItems, videoFactLink } from "../utils/testUtils";
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
  handleChange: jest.fn(),
  handleClick: jest.fn()
};

const setFactHandlers: SetFactHandlers = {
  handleDocumentSetClick: jest.fn(),
  handleVideoSetClick: jest.fn()
};

const initialState: TimelineViewState = {
  error: false,
  factLink: null,
  loading: true,
  selectedOption: "Debates",
  timelineItems: [],
  hashValues: null,
  hashIsValid: false
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

test("Error loading view", () => {
  const containerState: TimelineViewState = {
    ...initialState,
    loading: false,
    error: true
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
    error: false
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
    error: false,
    factLink: documentFactLink,
    loading: false,
    selectedOption: "Documents",
    timelineItems: timelineItems,
    hashValues: null,
    hashIsValid: true
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
    error: false,
    factLink: videoFactLink,
    loading: false,
    selectedOption: "Debates",
    timelineItems: timelineItems,
    hashValues: null,
    hashIsValid: true
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
