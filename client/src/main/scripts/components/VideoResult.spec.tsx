import * as React from "react";
import * as renderer from "react-test-renderer";
import VideoResult from "./VideoResult";
import { kennedyNixon } from "../utils/testUtils";

jest.mock("./VideoResultTurnList", () => ({
  default: "VideoResultTurnList"
}));

test("VideoResultPreview containing", () => {
  const tree = renderer
    .create(
      <VideoResult
        multiHighlight={{
          cut: [14, 239],
          highlights: [[18, 28]]
        }}
        onPlayClick={jest.fn()}
        sortBy="Containing"
        turn={0}
        turnContent="Good evening. The television and radio stations of the United States and their affiliated stations are proud to provide facilities for a discussion of issues in the current political campaign by the two major candidates for the presidency. The candidates need no introduction. The Republican candidate, Vice President Richard M. Nixon, and the Democratic candidate, Senator John F. Kennedy. According to rules set by the candidates themselves, each man shall make an opening statement of approximately eight minutes' duration and a closing statement of approximately three minutes' duration. In between the candidates will answer, or comment upon answers to questions put by a panel of correspondents. In this, the first discussion in a series of four - joint appearances, the subject matter has been agreed, will be restricted to internal or domestic American matters. And now for the first opening statement by Senator John F. Kennedy."
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("VideoResultPreview before and after", () => {
  const tree = renderer
    .create(
      <VideoResult
        multiHighlight={{
          cut: [0, 276],
          highlights: [[18, 28]]
        }}
        onPlayClick={jest.fn()}
        sortBy="BeforeAndAfter"
        turn={0}
        turnContent="Good evening. The television and radio stations of the United States and their affiliated stations are proud to provide facilities for a discussion of issues in the current political campaign by the two major candidates for the presidency. The candidates need no introduction. The Republican candidate, Vice President Richard M. Nixon, and the Democratic candidate, Senator John F. Kennedy. According to rules set by the candidates themselves, each man shall make an opening statement of approximately eight minutes' duration and a closing statement of approximately three minutes' duration. In between the candidates will answer, or comment upon answers to questions put by a panel of correspondents. In this, the first discussion in a series of four - joint appearances, the subject matter has been agreed, will be restricted to internal or domestic American matters. And now for the first opening statement by Senator John F. Kennedy."
        videoFact={kennedyNixon}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
