import * as React from "react";
import * as renderer from "react-test-renderer";
import VideoResultTurnList from "./VideoResultTurnList";
import {} from "jest";
import { kennedyNixon } from "../utils/testUtils";

jest.mock("./VideoResult", () => ({
  default: "VideoResult"
}));


test("VideoResultTurnList containing", () => {
  const tree = renderer
    .create(
      <VideoResultTurnList
        onPlayClick={jest.fn()}
        searchTerm="television"
        sortBy="Containing"
        turn={0}
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("VideoResultTurnList before and after", () => {
  const tree = renderer
    .create(
      <VideoResultTurnList
        onPlayClick={jest.fn()}
        searchTerm="television"
        sortBy="BeforeAndAfter"
        turn={0}
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
