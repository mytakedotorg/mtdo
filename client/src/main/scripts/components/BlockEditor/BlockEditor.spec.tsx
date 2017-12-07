// https://facebook.github.io/jest/docs/snapshot-testing.html#content

import * as React from "react";
import * as renderer from "react-test-renderer"; 
import {} from "jest";
import {} from "node";
import BlockEditor from "./BlockEditor";
import { TakeDocument } from "./BlockEditor";

const doc: TakeDocument = {
  title: "My take title",
  blocks: [
    {
      kind: "paragraph",
      text: "Some text"
    },
    {
      kind: "document",
      excerptId: "united-states-constitution",
      highlightedRange: [335, 438],
      viewRange: [327, 500]
    }
  ]
};

const handleChange = jest.fn();
const handleDelete = jest.fn();
const handleEnterPress = jest.fn();
const handleFocus = jest.fn();
const onDocumentClick = jest.fn();
const WritingEventHandlers = {
  handleChange,
  handleDelete,
  handleEnterPress,
  handleFocus
};
const ReadingEventHandler = {
  onDocumentClick
};

jest.mock("./EditorDocumentContainer", () => ({
  default: "EditorDocumentContainer"
}));

jest.mock("./EditorVideoContainer",  () => ({
  default: "EditorVideoContainer"
}));

function createNodeMock(element: React.ReactElement<HTMLElement>) {
  switch (element.type) {
    case "div": {
      return {
        resetHeight() {
          // Do nothing
        }
      };
    }
    case "textarea": {
      return {
        focus() {
          // Do nothing
        }
      };
    }
    case "p": {
      return {
        resetHeight() {
          // Do nothing
        }
      };
    }
    case "h1": {
      return {
        focus() {
          // Do nothing
        }
      };
    }
  }
}

test("Simple block editor model", () => {
  const tree = renderer
    .create(
      <BlockEditor
        takeDocument={doc}
        active={-1}
        eventHandlers={WritingEventHandlers}
      />,
      { createNodeMock }
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// test("With active", () => {
//   const tree = renderer
//     .create(
//       <BlockEditor
//         takeDocument={doc}
//         active={0}
//         eventHandlers={WritingEventHandlers}
//       />,
//       { createNodeMock }
//     )
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

// test("Read only", () => {
//   const tree = renderer
//     .create(
//       <BlockEditor takeDocument={doc} eventHandlers={ReadingEventHandler} />,
//       { createNodeMock }
//     )
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

/**
 * TODO:
 *   - Add the following test cases:
 *     + 'No text in editor, cursor in title, press enter'
 *     + 'Title only in editor, cursor in title, press enter'
 *     + 'Press enter when cursor is inside/before/after a TakeBlock'
 *     + 'Press backspace/delete when cursor is inside/before/after a TakeBlock'
 *     + 'Press backspace/delete if there is no title'
 *     + 'Press backspace/delete if there is no content in Take'
 *     + 'Press backspace/delete if there is no title or no content in Take'
 *     + 'Press backspace/delete if there is title and no content in Take'
 *     + 'Press backspace/delete if there is title and content in Take'
 *     + 'Press backspace/delete if there is no title and there is content in Take'
 */
