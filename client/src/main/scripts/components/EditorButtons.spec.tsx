import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
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
