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
import BlockEditor from "./BlockEditor";
import { TakeDocument } from "./BlockEditor";

const doc: TakeDocument = {
  title: "My take title",
  blocks: [
    {
      kind: "paragraph",
      text: "Some text",
    },
    {
      kind: "document",
      excerptId: "united-states-constitution",
      highlightedRange: [335, 438],
      viewRange: [327, 500],
    },
  ],
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
  handleFocus,
};
const ReadingEventHandler = {
  onDocumentClick,
};

jest.mock("./EditorDocumentContainer", () => ({
  default: "EditorDocumentContainer",
}));

jest.mock("./EditorVideoContainer", () => ({
  default: "EditorVideoContainer",
}));

function createNodeMock(element: React.ReactElement<HTMLElement>) {
  switch (element.type) {
    case "div": {
      return {
        resetHeight() {
          // Do nothing
        },
      };
    }
    case "textarea": {
      return {
        focus() {
          // Do nothing
        },
      };
    }
    case "p": {
      return {
        resetHeight() {
          // Do nothing
        },
      };
    }
    case "h1": {
      return {
        focus() {
          // Do nothing
        },
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

test("With active", () => {
  const tree = renderer
    .create(
      <BlockEditor
        takeDocument={doc}
        active={0}
        eventHandlers={WritingEventHandlers}
      />,
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
