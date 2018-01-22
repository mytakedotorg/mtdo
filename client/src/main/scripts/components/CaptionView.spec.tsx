import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionView, { CaptionViewEventHandlers } from "./CaptionView";
import { videoFact } from "../utils/testUtils";

jest.mock("./Document", () => ({
  default: "Document"
}));

jest.mock("./ClipEditor", () => ({
  default: "ClipEditor"
}));

const eventHandlers: CaptionViewEventHandlers = {
  onHighlight: jest.fn(),
  onClearPress: jest.fn(),
  onCursorPlace: jest.fn(),
  onFineTuneDown: jest.fn(),
  onFineTuneUp: jest.fn(),
  onPlayPausePress: jest.fn(),
  onRangeChange: jest.fn(),
  onRestartPress: jest.fn()
};

test("CaptionTextNodeList", () => {
  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFact}
        timer={0}
        captionIsHighlighted={false}
        clipStart={0}
        clipEnd={-1}
        highlightedCharRange={[-1, -1]}
        eventHandlers={eventHandlers}
        videoDuration={5224}
        isPaused={true}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("CaptionTextNodeList with highlights from props", () => {
  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFact}
        timer={5.31}
        captionIsHighlighted={true}
        clipStart={5.31}
        clipEnd={7.2}
        highlightedCharRange={[80, 128]}
        eventHandlers={eventHandlers}
        videoDuration={5224}
        isPaused={true}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// Add an action test case for when a user highlights caption text
