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
import EditorButtons from "./EditorButtons";

jest.mock("./Banner", () => ({
  default: "Banner"
}));

const eventHandlers = {
  handleDeleteClick: jest.fn(),
  handlePublishClick: jest.fn(),
  handleSaveClick: jest.fn()
};

test("Initial status", () => {
  const status = {
    saved: true,
    saving: false,
    error: false,
    message: ""
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Unsaved", () => {
  const status = {
    saved: false,
    saving: false,
    error: false,
    message: ""
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Saving", () => {
  const status = {
    saved: false,
    saving: true,
    error: false,
    message: ""
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Publishing", () => {
  const status = {
    saved: false,
    saving: true,
    error: false,
    message: "Publishing Take."
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Publishing error", () => {
  const status = {
    saved: false,
    saving: false,
    error: true,
    message: "There was an error publishing your Take."
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Title too long", () => {
  const status = {
    saved: false,
    saving: false,
    error: true,
    message: "Title cannot be longer than 255 characters."
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Saving", () => {
  const status = {
    saved: false,
    saving: true,
    error: false,
    message: "Saving Take."
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Save successful", () => {
  const status = {
    saved: true,
    saving: false,
    error: false,
    message: "Save successful!"
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Unknown error", () => {
  const status = {
    saved: false,
    saving: true,
    error: true,
    message: "There was an error modifying your Take."
  };
  const tree = renderer
    .create(<EditorButtons status={status} eventHandlers={eventHandlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
