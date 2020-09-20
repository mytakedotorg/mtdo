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
import HeaderWithPage from "./HeaderWithPage";

jest.mock("./SearchBar", () => ({
  __esModule: true,
  default: "SearchBar",
}));

jest.mock("./auth/UserNav", () => ({
  __esModule: true,
  default: "UserNav",
}));

test("HeaderWithPage homepage", () => {
  const tree = renderer
    .create(<HeaderWithPage args={{ type: "home" }} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("HeaderWithPage search page", () => {
  const tree = renderer
    .create(
      <HeaderWithPage
        args={{
          type: "search",
          searchTerm: "anything",
        }}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("HeaderWithPage other pages", () => {
  const tree = renderer.create(<HeaderWithPage />).toJSON();
  expect(tree).toMatchSnapshot();
});
