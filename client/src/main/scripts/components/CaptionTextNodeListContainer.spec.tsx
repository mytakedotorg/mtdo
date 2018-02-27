import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionTextNodeListContainer from "./CaptionTextNodeListContainer";
import { TimeRange, TRACKSTYLES__RANGE } from "./Video";
import { videoFactFast, videoNodes } from "../utils/testUtils";

const onMouseUp = jest.fn();
const onScroll = jest.fn();

const eventHandlers = {
  onMouseUp: onMouseUp,
  onScroll: onScroll
};

const view: TimeRange = {
  start: 0,
  end: 25,
  type: "VIEW",
  styles: TRACKSTYLES__RANGE,
  label: "Zoom"
};

jest.mock("./CaptionTextNodeList", () => ({
  default: "CaptionTextNode"
}));

test("CaptionTextNodeListContainer", () => {
  const tree = renderer
    .create(
      <CaptionTextNodeListContainer
        captionTimer={0}
        documentNodes={videoNodes}
        eventHandlers={eventHandlers}
        videoFact={videoFactFast}
        view={view}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
