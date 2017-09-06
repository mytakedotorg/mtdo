// https://facebook.github.io/jest/docs/snapshot-testing.html#content

import * as React from "react";
import * as renderer from "react-test-renderer";
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
      document: "AMENDMENTS",
      range: [369, 514]
    }
  ]
};

const handleChange = (id: number, value: string): void => {};
const handleDelete = (id: number): void => {};
const handleEnterPress = (): void => {};
const handleFocus = (id: number): void => {};
const onDocumentClick = jest.fn();
const WritingEventHandlers = {
  handleChange,
  handleDelete,
  handleEnterPress,
  handleFocus
};
const ReadingEventHandler = {
	onDocumentClick
}

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
  }
}

test("Simple block editor model", () => {
  const tree = renderer
    .create(
      <BlockEditor takeDocument={doc} active={-1} eventHandlers={WritingEventHandlers} />,
      { createNodeMock }
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("With active", () => {
  const tree = renderer
    .create(
      <BlockEditor takeDocument={doc} active={0} eventHandlers={WritingEventHandlers} />,
      { createNodeMock }
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Read only", () => {
  const tree = renderer
    .create(
      <BlockEditor takeDocument={doc} eventHandlers={ReadingEventHandler} />,
      { createNodeMock }
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

