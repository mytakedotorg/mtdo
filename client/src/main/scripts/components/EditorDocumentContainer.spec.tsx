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
  EditorDocumentBranch,
  EditorDocumentContainerProps,
  EditorDocumentContainerState,
} from "./EditorDocumentContainer";
import { documentFactLink, documentNodes } from "../utils/testUtils";

const mockFn = jest.fn();

const containerProps: EditorDocumentContainerProps = {
  active: false,
  block: {
    kind: "document",
    excerptId: "o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA=",
    highlightedRange: [11, 53],
    viewRange: [0, 218],
  },
  eventHandlers: {
    onDocumentClick: mockFn,
  },
  idx: 1,
};

const document = {
  fact: documentFactLink.fact,
  nodes: documentNodes,
};

test("Document loading", () => {
  const containerState: EditorDocumentContainerState = { loading: true };

  const tree = renderer
    .create(
      <EditorDocumentBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Document", () => {
  const containerState: EditorDocumentContainerState = {
    loading: false,
    document: document,
  };

  const tree = renderer
    .create(
      <EditorDocumentBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
