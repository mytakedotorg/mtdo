import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import VideoLite from "./VideoLite";
import { videoFactFast } from "../utils/testUtils";

jest.mock("react-youtube", () => ({
  default: "YouTube"
}));

test("Video", () => {
  const tree = renderer
    .create(
      <VideoLite
        videoFact={videoFactFast}
        clipRange={[10, 20]}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
