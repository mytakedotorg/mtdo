import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import { Reaction } from "./ReactionContainer";

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

const eventListeners = {
  onReportPress: jest.fn(),
  onStarPress: jest.fn()
};

test("Reaction - loading", () => {
  const tree = renderer
    .create(<Reaction containerState={{}} eventListeners={eventListeners} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - initial", () => {
  const tree = renderer
    .create(
      <Reaction containerState={initialState} eventListeners={eventListeners} />
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
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Reaction - initial", () => {
  const tree = renderer
    .create(
      <Reaction containerState={initialState} eventListeners={eventListeners} />
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
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
