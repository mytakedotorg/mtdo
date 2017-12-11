import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionView, { EventHandlers } from "./CaptionView";
import { videoFact } from "../utils/testUtils";

jest.mock("./Document", () => ({
  default: "Document"
}));

const eventHandlers: EventHandlers = {
  onHighlight: jest.fn(),
  onClearPress: jest.fn(),
  onCursorPlace: jest.fn(),
  onFineTuneDown: jest.fn(),
  onFineTuneUp: jest.fn()
};

test("CaptionTextNodeList", () => {
  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFact}
        timer={0}
        captionIsHighlighted={false}
        videoStart={0}
        videoEnd={-1}
        highlightedCharRange={[-1, -1]}
        eventHandlers={eventHandlers}
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
        videoStart={5.31}
        videoEnd={7.2}
        highlightedCharRange={[80, 128]}
        eventHandlers={eventHandlers}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// Add an action test case for when a user highlights caption text
