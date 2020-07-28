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
import BlockReader from "./BlockReader";
import { TakeDocument } from "./BlockEditor";

const doc: TakeDocument = {
  title: "My take title",
  blocks: [
    {
      kind: "paragraph",
      text: "",
    },
  ],
};

jest.mock("./ReactionContainer", () => ({
  __esModule: true,
  default: "ReactionContainer",
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

test("Read only", () => {
  // Object.defineProperty(window.location, 'pathname', {
  // 	writable: true,
  // 	value: 'anything'
  // });

  const tree = renderer
    .create(<BlockReader initState={doc} takeId={2} />, { createNodeMock })
    .toJSON();
  expect(tree).toMatchSnapshot();
});
