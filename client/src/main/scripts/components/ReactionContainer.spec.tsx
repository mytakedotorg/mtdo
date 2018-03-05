import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import { Reaction } from "./ReactionContainer";
import { takeDocument } from "../utils/testUtils";

const initialState = {
  takeState: {
    viewCount: 1,
    likeCount: 0
  },
  userState: {
    like: false,
    bookmark: false,
    spam: false,
    harassment: false,
    rulesviolation: false
  }
};

const containerProps = {
  takeId: 1,
  takeDocument: takeDocument
};

const eventListeners = {
  onReportPress: jest.fn(),
  onStarPress: jest.fn()
};

jest.mock("./DropDown", () => ({
  default: "DropDown"
}));

jest.mock("./EmailTake", () => ({
  default: "EmailTake"
}));

test("Reaction - loading", () => {
  const tree = renderer
    .create(
      <Reaction
        containerState={{}}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - initial", () => {
  const tree = renderer
    .create(
      <Reaction
        containerState={initialState}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - liked", () => {
  const containerState = {
    ...initialState,
    userState: {
      ...initialState.userState,
      like: true
    }
  };
  const tree = renderer
    .create(
      <Reaction
        containerState={containerState}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - initial", () => {
  const tree = renderer
    .create(
      <Reaction
        containerState={initialState}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - spam reported", () => {
  const containerState = {
    ...initialState,
    userState: {
      ...initialState.userState,
      spam: true
    }
  };
  const tree = renderer
    .create(
      <Reaction
        containerState={containerState}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - harassment reported", () => {
  const containerState = {
    ...initialState,
    userState: {
      ...initialState.userState,
      harassment: true
    }
  };
  const tree = renderer
    .create(
      <Reaction
        containerState={containerState}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - rules violated reported", () => {
  const containerState = {
    ...initialState,
    userState: {
      ...initialState.userState,
      rulesviolation: true
    }
  };
  const tree = renderer
    .create(
      <Reaction
        containerState={containerState}
        eventListeners={eventListeners}
        containerProps={containerProps}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
