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
import { TrackSliderEventHandlers } from "./TrackSlider";
import RangeContainer from "./RangeContainer";
import { rangeStyle } from "../utils/testUtils";

const eventHandlers: TrackSliderEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onRangeChange: jest.fn(),
};

test("Render a slider", () => {
  const tree = renderer
    .create(
      <RangeContainer
        defaultValue={0}
        eventHandlers={eventHandlers}
        handleStyle={rangeStyle}
        label={"Now Playing"}
        max={5224}
        min={0}
        railStyle={rangeStyle}
        stateAuthority={"SCROLL"}
        step={1}
        trackStyle={rangeStyle}
        type={"CURRENT_TIME"}
        value={1889}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Render a range", () => {
  const tree = renderer
    .create(
      <RangeContainer
        defaultValue={[0, 5224]}
        eventHandlers={eventHandlers}
        handleStyle={rangeStyle}
        label={"Zoom"}
        max={5224}
        min={0}
        railStyle={rangeStyle}
        stateAuthority={"SCROLL"}
        step={1}
        trackStyle={rangeStyle}
        type={"ZOOM"}
        value={[1871, 1891]}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
