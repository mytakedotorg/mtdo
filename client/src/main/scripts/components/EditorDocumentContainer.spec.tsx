import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  EditorDocumentBranch,
  EditorDocumentContainerProps,
  EditorDocumentContainerState
} from "./EditorDocumentContainer";
import { documentFactLink, documentNodes } from "../utils/testUtils";

const mockFn = jest.fn();

const containerProps: EditorDocumentContainerProps = {
  active: false,
  block: {
    kind: "document",
    excerptId: "o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA=",
    highlightedRange: [11, 53],
    viewRange: [0, 218]
  },
  eventHandlers: {
    onDocumentClick: mockFn
  },
  idx: 1
};

const document = {
  fact: documentFactLink.fact,
  nodes: documentNodes
};

test("Document loading", () => {
  const containerState: EditorDocumentContainerState = {
    loading: true,
    error: false
  };

  const tree = renderer
    .create(
      <EditorDocumentBranch
        containerProps={containerProps}
        containerState={containerState}
        handleRetryClick={mockFn}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Error loading Document", () => {
  const containerState: EditorDocumentContainerState = {
    loading: false,
    error: true
  };

  const tree = renderer
    .create(
      <EditorDocumentBranch
        containerProps={containerProps}
        containerState={containerState}
        handleRetryClick={mockFn}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Document", () => {
  const containerState: EditorDocumentContainerState = {
    loading: false,
    error: false,
    document: document
  };

  const tree = renderer
    .create(
      <EditorDocumentBranch
        containerProps={containerProps}
        containerState={containerState}
        handleRetryClick={mockFn}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
