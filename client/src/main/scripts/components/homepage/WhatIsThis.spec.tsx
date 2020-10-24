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
import WhatIsThis from "./WhatIsThis";

jest.mock("./HomeSection", () => ({
  __esModule: true,
  default: "HomeSection",
}));
jest.mock("./NGramLoader", () => ({
  __esModule: true,
  default: "NGramLoader",
}));
jest.mock("./AnimatedHeading", () => ({
  __esModule: true,
  default: "AnimatedHeading",
}));
jest.retryTimes(3);

test("WhatIsThis", async () => {
  const tree = renderer
    .create(<WhatIsThis  />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
