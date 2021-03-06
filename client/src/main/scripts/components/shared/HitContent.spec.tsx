/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import React from "react";
import renderer from "react-test-renderer";
import { VideoTurn } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { kennedyNixon } from "../../utils/testUtils";
import HitContent from "./HitContent";

interface HitProps {
  videoFact: FT.VideoFactContent;
  videoTurn: VideoTurn;
}

export const HitMock = (componentName: string) => ({
  videoFact,
  videoTurn,
  ...rest
}: HitProps): JSX.Element => {
  return (
    <div>
      {componentName}: {JSON.stringify(rest)} {videoFact.fact.title}{" "}
      {videoTurn.turn} {videoTurn.cut} {videoTurn.highlight}
    </div>
  );
};

test("HitContent renders", () => {
  const videoTurn: VideoTurn = {
    kind: "videoTurn",
    fact: "factHash",
    turn: 0,
    cut: [14, 239],
    highlight: [[18, 28, 0]],
  };
  const tree = renderer
    .create(
      <HitContent
        videoFact={kennedyNixon}
        videoTurn={videoTurn}
        className="testClass"
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
