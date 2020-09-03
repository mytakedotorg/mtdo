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
} from "../components/bookmarks/bookmarks";
import { FoundationHarness } from "./foundationTest";
import { ClipRange, VideoTurn } from "./social/social";
import { cutToTurn, turnToCut } from "./video";

const turn: VideoTurn = {
  cut: [0, 13],
  fact: "GbeeimPkwH38zIwu7kYGmQ6NyE9PgBVYVKfYoiVilFI=",
  kind: "videoTurn",
  turn: 45,
};
const foundation = FoundationHarness.loadAllFromDisk();
const videoFact = foundation.getVideo(turn.fact);

test("turnToCut then cutToTurn", () => {
  const cut = turnToCut(turn, videoFact);
  expect(cutToTurn(cut, videoFact)).toEqual(turn);
});

test("bookmarkToIntermediate then intermediateToBookmark", () => {
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

test("turnToCut then cutToTurn with bookmark", () => {
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
