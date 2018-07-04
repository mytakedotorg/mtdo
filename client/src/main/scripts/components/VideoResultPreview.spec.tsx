import * as React from "react";
import * as renderer from "react-test-renderer";
import VideoResultPreview from "./VideoResultPreview";
import { kennedyNixon } from "../utils/testUtils";

jest.mock("./VideoResultTurnList", () => ({
  default: "VideoResultTurnList"
}));

test("VideoResultPreview containing", () => {
  const tree = renderer
    .create(
      <VideoResultPreview
        eventHandlers={{ onPlayClick: jest.fn() }}
        searchTerm="richard"
        sortBy="Containing"
        turns={[2, 0]}
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
