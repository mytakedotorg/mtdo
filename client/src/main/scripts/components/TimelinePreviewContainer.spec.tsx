import * as React from "react";
import * as renderer from "react-test-renderer";
import {
  TimelinePreviewContainerBranch,
  TimelinePreviewContainerProps,
  TimelinePreviewContainerState
} from "./TimelinePreviewContainer";
import {
  documentFactLink,
  documentNodes,
  videoFactFast,
  videoFactLink
} from "../utils/testUtils";

jest.mock("./TimelinePreview", () => ({
  default: "TimelinePreview"
}));

const setFactHandlers = {
  handleDocumentSetClick: jest.fn(),
  handleVideoSetClick: jest.fn(),
  handleRangeSet: jest.fn(),
  handleRangeCleared: jest.fn()
};

const containerProps = {
  factLink: documentFactLink
};

test("Preview loading", () => {
  const containerState: TimelinePreviewContainerState = {
    loading: true
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
    nodes: documentNodes
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
      viewRange: [0, 218]
    },
    setFactHandlers: setFactHandlers
  };
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    nodes: documentNodes
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
    setFactHandlers: setFactHandlers
  };
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    videoFact: videoFactFast
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
