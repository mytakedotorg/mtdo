/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
import { Foundation } from "./foundation";
import { VideoTurn } from "./social/social";
import { cutToTurn, turnToCut } from "./video";

const turn: VideoTurn = {
  cut: [0, 13],
  fact: "E74aoUY=e57bb551092196eedf8c157d000f26660084e1c2",
  kind: "videoTurn",
  turn: 45,
};

test("turnToCut then cutToTurn", async () => {
  const videoFact = await Foundation.justOneVideo(turn.fact);
  const cut = turnToCut(turn, videoFact);
  expect(cutToTurn(cut, videoFact)).toEqual(turn);
});
