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
import * as React from "react";
import * as renderer from "react-test-renderer";
import Drawer from "./Drawer";
import { INFO_HEADER_TABS_ENUM } from "./infoHeader";

jest.mock("./DrawerContents", () => ({
  __esModule: true,
  default: "DrawerContents",
}));

test("Drawer - expanded", () => {
  const props = {
    activeTab: INFO_HEADER_TABS_ENUM.HOW_TO_USE_THIS,
    onClose: jest.fn(),
    isExpanded: true,
  };
  const tree = renderer.create(<Drawer {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});

test("Drawer - collapsed", () => {
  const props = {
    activeTab: INFO_HEADER_TABS_ENUM.HOW_TO_USE_THIS,
    onClose: jest.fn(),
    isExpanded: false,
  };
  const tree = renderer.create(<Drawer {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
