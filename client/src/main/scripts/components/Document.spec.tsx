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
import Document from "./Document";
import { documentNodes } from "../utils/testUtils";

const className = "document__row";
const onMouseUp = jest.fn();
const onScroll = jest.fn();

const eventHandlers = {
  onMouseUp: onMouseUp,
  onScroll: onScroll
};

jest.mock("./DocumentTextNodeList", () => ({
  default: "DocumentTextNodeList"
}));

jest.mock("./CaptionTextNodeList", () => ({
  default: "CaptionTextNodeList"
}));

test("Document component", () => {
  const tree = renderer
    .create(
      <Document
        nodes={documentNodes}
        className={className}
        eventHandlers={eventHandlers}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

const children = (
  <div className="editor__block editor__block--overlay" style={{ top: "16px" }}>
    <div className="editor__document editor__document--hover">
      <p data-char-offset="0">
        Section 1.{" "}
        <span className="document__text--selected">
          Neither slavery nor involuntary servitude
        </span>, except as a punishment for crime whereof the party shall have
        been duly convicted, shall exist within the United States, or any place
        subject to their jurisdiction.
      </p>
    </div>
  </div>
);

test("Document component with highlights", () => {
  const tree = renderer
    .create(
      <Document
        nodes={documentNodes}
        className={className}
        eventHandlers={eventHandlers}
      >
        {children}
      </Document>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
