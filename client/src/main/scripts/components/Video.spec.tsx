import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import Video from "./Video";
import { videoFact } from "../utils/testUtils";

jest.mock("react-youtube", () => ({
  default: "YouTube"
}));

jest.mock("./CaptionView", () => ({
  default: "CaptionView"
}));

const mockFn = jest.fn();

test("Video", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFact}
        onSetClick={mockFn}
        className={"video__inner-container"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Video with highlights", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFact}
        onSetClick={mockFn}
        className={"video__inner-container"}
        timeRange={[0, 3]} // Test range can't go outside of videoFact.transcript range
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
