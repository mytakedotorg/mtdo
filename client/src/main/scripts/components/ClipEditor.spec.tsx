import * as React from "react";
import * as renderer from "react-test-renderer";
import ClipEditor, { ClipEditorEventHandlers } from "./ClipEditor";
import {
  initialRangeSliders,
  unzoomedRangeSliders,
  zoomedRangeSliders,
  videoFactLink
} from "../utils/testUtils";

jest.mock("./ZoomViewer", () => ({
  default: "ZoomViewer"
}));

jest.mock("./TrackSlider", () => ({
  default: "TrackSlider"
}));

jest.mock("./ShareClip", () => ({
	default: "ShareClip"
}));

const eventHandlers: ClipEditorEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onClearPress: jest.fn(),
  onPlayPausePress: jest.fn(),
  onRangeChange: jest.fn(),
  onRestartPress: jest.fn(),
  onSkipBackPress: jest.fn(),
  onSkipForwardPress: jest.fn(),
  onZoomToClipPress: jest.fn()
};

test("Initial ClipEditor", () => {
  const tree = renderer
    .create(
      <ClipEditor
        eventHandlers={eventHandlers}
        captionIsHighlighted={false}
        currentTime={0}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={false}
        rangeSliders={initialRangeSliders}
        stateAuthority={"SCROLL"}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("ClipEditor with zoomed selection", () => {
  const tree = renderer
    .create(
      <ClipEditor
        eventHandlers={eventHandlers}
        captionIsHighlighted={true}
        currentTime={3.87}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={true}
        rangeSliders={zoomedRangeSliders}
        stateAuthority={"SCROLL"}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("ClipEditor with zoomed selection", () => {
  const tree = renderer
    .create(
      <ClipEditor
        eventHandlers={eventHandlers}
        captionIsHighlighted={true}
        currentTime={3.87}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={false}
        rangeSliders={unzoomedRangeSliders}
        stateAuthority={"SCROLL"}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
