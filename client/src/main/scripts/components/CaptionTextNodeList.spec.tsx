import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionTextNodeList from "./CaptionTextNodeList";
import { TimeRange, TRACKSTYLES__RANGE } from "./Video";
import { videoFactFast, videoNodes } from "../utils/testUtils";

const onMouseUp = jest.fn();
const onScroll = jest.fn();

const eventHandlers = {
  onMouseUp: onMouseUp,
  onScroll: onScroll
};
const className = "document__text document__text--caption";

jest.mock("./CaptionTextNode", () => ({
  default: "CaptionTextNode"
}));

const view: TimeRange = {
  start: 0,
  end: 25,
  type: "VIEW",
  styles: TRACKSTYLES__RANGE,
  label: "Zoom"
};

test("CaptionTextNodeList", () => {
  const tree = renderer
    .create(
      <CaptionTextNodeList
        captionTimer={0}
        className={className}
        documentNodes={videoNodes}
        eventHandlers={eventHandlers}
        videoFact={videoFactFast}
        view={view}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
