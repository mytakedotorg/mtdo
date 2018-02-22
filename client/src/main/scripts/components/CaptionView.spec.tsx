import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionView, { CaptionViewEventHandlers } from "./CaptionView";
import { TimeRange, TRACKSTYLES__RANGE } from "./Video";
import { videoFactFast } from "../utils/testUtils";

jest.mock("./Document", () => ({
  default: "Document"
}));

jest.mock("./ClipEditor", () => ({
  default: "ClipEditor"
}));

const eventHandlers: CaptionViewEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onClearPress: jest.fn(),
  onHighlight: jest.fn(),
  onPlayPausePress: jest.fn(),
  onRangeChange: jest.fn(),
  onRestartPress: jest.fn(),
  onScroll: jest.fn(),
  onSkipBackPress: jest.fn(),
  onSkipForwardPress: jest.fn(),
  onZoomToClipPress: jest.fn()
};

test("CaptionTextNodeList", () => {
  const viewRange: TimeRange = {
    start: 0,
    end: 25,
    type: "VIEW",
    styles: TRACKSTYLES__RANGE,
    label: "Zoom"
  };
  const selectionRange: TimeRange = {
    start: 0,
    end: 0,
    type: "SELECTION",
    styles: TRACKSTYLES__RANGE,
    label: "Clip"
  };
  const rangeSliders = [viewRange, selectionRange];

  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFactFast}
        timer={0}
        captionIsHighlighted={false}
        highlightedCharRange={[-1, -1]}
        eventHandlers={eventHandlers}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={false}
        rangeSliders={rangeSliders}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("CaptionTextNodeList with highlights from props", () => {
  const viewRange: TimeRange = {
    start: 3.6,
    end: 8.7,
    type: "VIEW",
    styles: TRACKSTYLES__RANGE,
    label: "Zoom"
  };
  const selectionRange: TimeRange = {
    start: 5.3,
    end: 7.2,
    type: "SELECTION",
    styles: TRACKSTYLES__RANGE,
    label: "Zoom"
  };
  const rangeSliders = [viewRange, selectionRange];

  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFactFast}
        timer={5.31}
        captionIsHighlighted={true}
        highlightedCharRange={[80, 128]}
        eventHandlers={eventHandlers}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={true}
        rangeSliders={rangeSliders}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// Add an action test case for when a user highlights caption text
