import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  TimelineViewBranch,
  TimelineViewState,
  EventHandlers
} from "./TimelineView";
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

const documentFactLink: Foundation.FactLink = {
  fact: {
    title: "Amendment 13",
    primaryDate: "1865-12-06",
    primaryDateKind: "ratified",
    kind: "document"
  },
  hash: "o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA="
};

const videoFactLink: Foundation.FactLink = {
  fact: {
    title: "Donald Trump - Hillary Clinton (2/3)",
    primaryDate: "2016-10-09",
    primaryDateKind: "recorded",
    kind: "video"
  },
  hash: "U8MV5KDDaxumxZOCJOzExAUAAkSoYNhycVXq7jZ59_0="
};

const timelineItems = [
  {
    id: "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    idx: "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    start: new Date("1788-06-21T00:00:00.000Z"),
    content: "United States Constitution",
    kind: "document"
  },
  {
    id: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
    idx: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
    start: new Date("1791-12-15T00:00:00.000Z"),
    content: "Bill of Rights",
    kind: "document"
  },
  {
    id: "-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=",
    idx: "-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=",
    start: new Date("1960-09-26T00:00:00.000Z"),
    content: "John F. Kennedy - Nixon (1/4)",
    kind: "video"
  },
  {
    id: "bl03RovlxbTZK0yu25_VikP0Y2xSj-J9oFyGUTWIOZQ=",
    idx: "bl03RovlxbTZK0yu25_VikP0Y2xSj-J9oFyGUTWIOZQ=",
    start: new Date("1960-10-07T00:00:00.000Z"),
    content: "John F. Kennedy - Nixon (2/4)",
    kind: "video"
  }
];

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
