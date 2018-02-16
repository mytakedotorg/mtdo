import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionTextNodeList from "./CaptionTextNodeList";
import { videoFact, videoNodes } from "../utils/testUtils";

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

const view = {
  start: 0,
  end: 5
};

test("CaptionTextNodeList", () => {
  const tree = renderer
    .create(
      <CaptionTextNodeList
        documentNodes={videoNodes}
        eventHandlers={eventHandlers}
        className={className}
        captionTimer={0}
        captionTranscript={videoFact.transcript}
        speakerMap={videoFact.speakerMap}
        view={view}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
