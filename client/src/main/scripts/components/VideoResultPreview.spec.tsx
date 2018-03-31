import * as React from "react";
import * as renderer from "react-test-renderer";
import VideoResultPreview from "./VideoResultPreview";
import { VideoResultPreviewLoadingView } from "./VideoFactsLoader";
import {} from "jest";
import { kennedyNixon } from "../utils/testUtils";

jest.mock("./VideoResultTurnList", () => ({
  default: "VideoResultTurnList"
}));

test("Loading view while requesting invidual video facts", () => {
  const tree = renderer.create(<VideoResultPreviewLoadingView />).toJSON();
  expect(tree).toMatchSnapshot();
});

test("VideoResultPreview containing", () => {
  const tree = renderer
    .create(
      <VideoResultPreview
        onPlayClick={jest.fn()}
        searchTerm="richard"
        sortBy="Containing"
        turns={[2, 0]}
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
