/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
import React from "react";
import renderer from "react-test-renderer";
import LoginModalView, { LoginModalViewEvents } from "./LoginModalView";

jest.mock("react-modal", () => ({
  __esModule: true,
  default: "Modal",
}));

const events: LoginModalViewEvents = {
  onFormSubmit: jest.fn(),
  onRequestClose: jest.fn(),
};

test("LoginModalView open", () => {
  const tree = renderer
    .create(<LoginModalView isOpen={true} events={events} showForm={true} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("LoginModalView closed", () => {
  const tree = renderer
    .create(<LoginModalView isOpen={false} events={events} showForm={true} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("LoginModalView open with response", () => {
  const tree = renderer
    .create(
      <LoginModalView
        isOpen={true}
        events={events}
        loginRes={{
          title: "Title Text",
          body: "Lorem ipsum body.",
          btn: "Button Text",
        }}
        showForm={false}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("LoginModalView open with response and form", () => {
  const tree = renderer
    .create(
      <LoginModalView
        isOpen={true}
        events={events}
        loginRes={{
          title: "Login Required",
          body: "Your login timed out.",
        }}
        showForm={true}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
