/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import DropDown from "./DropDown";

const Toggle = <span>toggle text</span>;
const Children = (
  <div>
    <p>Some child</p>
  </div>
);

test("DropDown BL", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BL"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown disabled", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BL"
        disabled={true}
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown enabled", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BL"
        disabled={false}
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown BR", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BR"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown TL", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="TL"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown TR", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="TR"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
