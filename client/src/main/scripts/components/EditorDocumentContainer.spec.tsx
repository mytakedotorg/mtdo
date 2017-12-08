import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  EditorDocumentBranch,
  EditorDocumentContainerProps,
  EditorDocumentContainerState
} from "./EditorDocumentContainer";

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
  fact: {
    title: "Amendment 13",
    primaryDate: "1865-12-06",
    primaryDateKind: "ratified",
    kind: "document"
  },
  nodes: [
    {
      component: "p",
      innerHTML: [
        "Section 1. Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction."
      ],
      offset: 0
    },
    {
      component: "p",
      innerHTML: [
        "Section 2. Congress shall have power to enforce this article by appropriate legislation."
      ],
      offset: 218
    }
  ]
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
