import * as React from "react";
import * as renderer from "react-test-renderer";
import CaptionTextNodeList from "./CaptionTextNodeList";
import { videoFactFast, videoNodes } from "../utils/testUtils";

const onMouseUp = jest.fn();
const onScroll = jest.fn();

const eventHandlers = {
  onMouseUp: onMouseUp,
  onScroll: onScroll
};

jest.mock("./CaptionTextNode", () => ({
  default: "CaptionTextNode"
}));

test("CaptionTextNodeList", () => {
  const tree = renderer
    .create(
      <CaptionTextNodeList
        documentNodes={videoNodes}
        eventHandlers={eventHandlers}
        videoFact={videoFactFast}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
