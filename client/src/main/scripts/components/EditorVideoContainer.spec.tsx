import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  EditorVideoBranch,
  EditorVideoContainerProps,
  EditorVideoContainerState
} from "./EditorVideoContainer";
import { Foundation } from "../java2ts/Foundation";
import { videoFactFast } from "../utils/testUtils";

const mockFn = jest.fn();

jest.mock("./Video", () => ({
  default: "Video"
}));

const containerProps: EditorVideoContainerProps = {
  idx: 2,
  active: false,
  block: {
    kind: "video",
    range: [2, 4],
    videoId: "iEfwIxM7MmnOKb7zt4HqW8IxUWy6F7a236fSOQlUUWI="
  }
};

test("Video loading", () => {
  const containerState: EditorVideoContainerState = { loading: true };

  const tree = renderer
    .create(
      <EditorVideoBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Video", () => {
  const containerState: EditorVideoContainerState = {
    loading: false,
    videoFact: videoFactFast
  };

  const tree = renderer
    .create(
      <EditorVideoBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
