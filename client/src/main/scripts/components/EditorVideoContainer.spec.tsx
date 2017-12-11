import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  EditorVideoBranch,
  EditorVideoContainerProps,
  EditorVideoContainerState
} from "./EditorVideoContainer";
import { Foundation } from "../java2ts/Foundation";
import { videoFact } from "../utils/testUtils";

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
    videoId: "U8MV5KDDaxumxZOCJOzExAUAAkSoYNhycVXq7jZ59_0="
  }
};

test("Video loading", () => {
  const containerState: EditorVideoContainerState = {
    loading: true,
    error: false
  };

  const tree = renderer
    .create(
      <EditorVideoBranch
        containerProps={containerProps}
        containerState={containerState}
        handleRetryClick={mockFn}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Error loading Video", () => {
  const containerState: EditorVideoContainerState = {
    loading: false,
    error: true
  };

  const tree = renderer
    .create(
      <EditorVideoBranch
        containerProps={containerProps}
        containerState={containerState}
        handleRetryClick={mockFn}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Video", () => {
  const containerState: EditorVideoContainerState = {
    loading: false,
    error: false,
    videoFact: videoFact
  };

  const tree = renderer
    .create(
      <EditorVideoBranch
        containerProps={containerProps}
        containerState={containerState}
        handleRetryClick={mockFn}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
