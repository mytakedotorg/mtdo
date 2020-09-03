import {
  bookmarkToIntermediate,
  intermediateToBookmark,
} from "../components/bookmarks/bookmarks";
import { FoundationHarness } from "./foundationTest";
import { VideoTurn } from "./social/social";
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
  const bookmark = {
    content: turnToCut(turn, videoFact),
    savedAt: new Date(),
  };
  expect(intermediateToBookmark(bookmarkToIntermediate(bookmark))).toEqual(
    bookmark
  );
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
