/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { Reaction } from "./ReactionContainer";
import { takeDocument } from "../utils/testUtils";

const initialState = {
  takeState: {
    viewCount: 1,
    likeCount: 0,
  },
  userState: {
    like: false,
    bookmark: false,
    spam: false,
    harassment: false,
    rulesviolation: false,
  },
};

const containerProps = {
  takeId: 1,
  takeDocument: takeDocument,
};

const eventListeners = {
  onReportPress: jest.fn(),
  onStarPress: jest.fn(),
  onFollowPress: jest.fn(),
};

jest.mock("./DropDown", () => ({
  __esModule: true,
  default: "DropDown",
}));

jest.mock("./EmailTake", () => ({
  __esModule: true,
  default: "EmailTake",
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
      like: true,
    },
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
      spam: true,
    },
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
      harassment: true,
    },
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
      rulesviolation: true,
    },
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

test("Reaction - user followed", () => {
  const containerState = {
    ...initialState,
    isFollowing: true,
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

test("Reaction - user unfollowed", () => {
  const containerState = {
    ...initialState,
    isFollowing: false,
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
