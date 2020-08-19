/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
import { timelineItems } from "../../utils/testUtils";
import Timeline from "./Timeline";

// These tests do not work as expected. Vis.Timeline is a Portal component.
// The timelineItems are "rendered" outside of the root React component in the
// virtual DOM. These snapshots just show empty divs. Not sure how to test this.
// https://github.com/airbnb/enzyme/issues/252 might be a start.

test("Debates Timeline", () => {
  const tree = renderer
    .create(
      <Timeline
        timelineItems={timelineItems}
        onItemClick={jest.fn()}
        selectedOption={Corpus.Debates}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Documents Timeline", () => {
  const tree = renderer
    .create(
      <Timeline
        timelineItems={timelineItems}
        onItemClick={jest.fn()}
        selectedOption={Corpus.Documents}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
