import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import { TrackSliderEventHandlers } from "./TrackSlider";
import RangeContainer from "./RangeContainer";
import { rangeStyle } from "../utils/testUtils";

const eventHandlers: TrackSliderEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onRangeChange: jest.fn()
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
        stateAuthority={"VIEW"}
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
        stateAuthority={"VIEW"}
        step={1}
        trackStyle={rangeStyle}
        type={"ZOOM"}
        value={[1871, 1891]}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
