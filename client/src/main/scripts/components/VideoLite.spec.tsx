import * as React from "react";
import * as renderer from "react-test-renderer";
import VideoLite from "./VideoLite";
import { videoFactFast } from "../utils/testUtils";

jest.mock("react-youtube", () => ({
  default: "YouTube"
}));

test("Video", () => {
  const tree = renderer
    .create(
      <VideoLite videoId={videoFactFast.youtubeId} clipRange={[10, 20]} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
