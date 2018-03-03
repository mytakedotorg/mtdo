import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import Video from "./Video";
import { videoFactFast } from "../utils/testUtils";

jest.mock("react-youtube", () => ({
  default: "YouTube"
}));

jest.mock("./CaptionView", () => ({
  default: "CaptionView"
}));

jest.mock("./DropDown", () => ({
  default: "DropDown"
}));

jest.mock("./EmailTake", () => ({
  default: "EmailTake"
}));

const mockFn = jest.fn();

test("Video", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFactFast}
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
        videoFact={videoFactFast}
        onSetClick={mockFn}
        className={"video__inner-container"}
        clipRange={[0, 3]} // Test range can't go outside of videoFact.transcript range
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
