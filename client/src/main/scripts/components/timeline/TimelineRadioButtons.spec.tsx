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
import { Corpus } from "../../common/social/social";
import TimelineRadioButtons from "./TimelineRadioButtons";

const mockFn = jest.fn();

test("Debates selected", () => {
  const tree = renderer
    .create(
      <TimelineRadioButtons onChange={mockFn} selectedOption={Corpus.Debates} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Documents selected", () => {
  const tree = renderer
    .create(
      <TimelineRadioButtons
        onChange={mockFn}
        selectedOption={Corpus.Documents}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
