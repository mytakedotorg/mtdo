import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionTextNodeList from "./CaptionTextNodeList";
import { videoFact, videoNodes } from "../utils/testUtils";

const onMouseUp = jest.fn();
const className = "document__text document__text--caption";

jest.mock("./CaptionTextNode", () => ({
  default: "CaptionTextNode"
}));

test("CaptionTextNodeList", () => {
  const tree = renderer
    .create(
      <CaptionTextNodeList
        documentNodes={videoNodes}
        onMouseUp={onMouseUp}
        className={className}
        captionTimer={0}
        captionTranscript={videoFact.transcript}
        speakerMap={videoFact.speakerMap}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
