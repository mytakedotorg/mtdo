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
import TrackSlider, { TrackSliderEventHandlers } from "./TrackSlider";
import {
  initialRangeSliders,
  unzoomedRangeSliders,
  zoomedRangeSliders,
} from "../utils/testUtils";

const eventHandlers: TrackSliderEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onRangeChange: jest.fn(),
};

jest.mock("./RangeContainer", () => ({
  __esModule: true,
  default: "RangeContainer",
}));

test("Initial render", () => {
  const tree = renderer
    .create(
      <TrackSlider
        start={0}
        end={5224}
        eventHandlers={eventHandlers}
        rangeSliders={initialRangeSliders}
        stateAuthority={"SCROLL"}
        step={1}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Zoomed render", () => {
  const tree = renderer
    .create(
      <TrackSlider
        start={4}
        end={82}
        eventHandlers={eventHandlers}
        rangeSliders={zoomedRangeSliders}
        stateAuthority={"SCROLL"}
        step={0.1}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Unzoomed render", () => {
  const tree = renderer
    .create(
      <TrackSlider
        start={4}
        end={82}
        eventHandlers={eventHandlers}
        rangeSliders={unzoomedRangeSliders}
        stateAuthority={"SCROLL"}
        step={0.1}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
