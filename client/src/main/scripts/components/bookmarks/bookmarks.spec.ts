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
import {
  Bookmark,
  bookmarkToIntermediate,
  intermediateToBookmark,
} from "./bookmarks";
import { Foundation } from "../../common/foundation";
import { ClipRange, VideoTurn } from "../../common/social/social";
import { cutToTurn, turnToCut } from "../../common/video";

const turn: VideoTurn = {
  cut: [0, 13],
  fact: "E74aoUY=e57bb551092196eedf8c157d000f26660084e1c2",
  kind: "videoTurn",
  turn: 45,
};

test("bookmarkToIntermediate then intermediateToBookmark", async () => {
  const videoFact = await Foundation.justOneVideo(turn.fact);
  const bookmark: Bookmark = {
    content: turnToCut(turn, videoFact),
    savedAt: new Date(),
  };
  const convertedBookmark = intermediateToBookmark(
    bookmarkToIntermediate(bookmark)
  );
  const pluckedBookmark = pluckCutFromBookmark(bookmark);
  const pluckedConvertedBookmark = pluckCutFromBookmark(convertedBookmark);
  expect(pluckedBookmark.rest).toEqual(pluckedConvertedBookmark.rest);
  expect(pluckedBookmark.cut[0]).toBeCloseTo(pluckedConvertedBookmark.cut[0]);
  expect(pluckedBookmark.cut[1]).toBeCloseTo(pluckedConvertedBookmark.cut[1]);
});

test("turnToCut then cutToTurn with bookmark", async () => {
  const videoFact = await Foundation.justOneVideo(turn.fact);
  const bookmark = {
    content: turnToCut(turn, videoFact),
    savedAt: new Date(),
  };
  const intermediateBookmark = bookmarkToIntermediate(bookmark);
  const bookmark2 = intermediateToBookmark(intermediateBookmark);
  const turn2 = cutToTurn(bookmark2.content, videoFact);
  expect(turn2).toEqual(turn);
});

interface PluckedBookmark {
  cut: ClipRange;
  rest: {
    fact: string;
    kind: "videoCut";
  };
}
function pluckCutFromBookmark(bookmark: Bookmark): PluckedBookmark {
  const { cut, ...rest } = bookmark.content;
  return { cut, rest };
}
