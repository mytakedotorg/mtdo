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
var base64toArrayBuffer = require("base64-arraybuffer");
import { FT } from "../java2ts/FT";
import { abbreviate, bsRoundEarly } from "./functions";
import {
  CharOffsetRange,
  ClipRange,
  VideoCut,
  VideoTurn,
} from "./social/social";

export function decodeVideoFact(
  encoded: FT.VideoFactContentEncoded
): FT.VideoFactContent {
  var wordChar, wordTime, turnSpeaker, turnWord: ArrayLike<number>;
  var factset: FT.Factset;
  if (encoded.fact.kind === "video") {
    const data: ArrayBuffer = base64toArrayBuffer.decode(encoded.data);
    // TODO: data is little-endian.  If the user's browser is big-endian,
    // the decoding will be invalid.  Someday we should detect if the
    // browser is big-endian, and do an endian-swap if it is.  No point
    // doing this until/if we actually have a big-endian device to test
    // with.

    var offset = 0;
    wordChar = new Int32Array(data, offset, encoded.totalWords);
    offset += encoded.totalWords * Int32Array.BYTES_PER_ELEMENT;
    wordTime = new Float32Array(data, offset, encoded.totalWords);
    offset += encoded.totalWords * Float32Array.BYTES_PER_ELEMENT;
    turnSpeaker = new Int32Array(data, offset, encoded.totalTurns);
    offset += encoded.totalTurns * Int32Array.BYTES_PER_ELEMENT;
    turnWord = new Int32Array(data, offset, encoded.totalTurns);
    offset += encoded.totalTurns * Int32Array.BYTES_PER_ELEMENT;
    if (offset != data.byteLength) {
      throw Error("Sizes don't match");
    }
    if (encoded.factset) {
      factset = encoded.factset;
    } else {
      factset = {
        id: "us-presidential-debates",
        title: "U.S. Presidential Debates",
      };
    }
  } else {
    throw `Unhandled video encoding ${encoded.fact.kind}`;
  }
  return {
    fact: encoded.fact,
    factset: encoded.factset,
    location: encoded.location,
    notes: encoded.notes,
    durationSeconds: encoded.durationSeconds,
    youtubeId: encoded.youtubeId,
    speakers: encoded.speakers,
    plainText: encoded.plainText,
    wordChar: wordChar,
    wordTime: wordTime,
    turnSpeaker: turnSpeaker,
    turnWord: turnWord,
  };
}

export function getTurnContent(
  turn: number,
  videoFact: FT.VideoFactContent
): string {
  const firstWord = videoFact.turnWord[turn];
  const firstChar = videoFact.wordChar[firstWord];

  if (videoFact.turnWord[turn + 1]) {
    const lastWord = videoFact.turnWord[turn + 1];
    const lastChar = videoFact.wordChar[lastWord] - 1;
    return videoFact.plainText.substring(firstChar, lastChar);
  } else {
    // Result is in last turn
    return videoFact.plainText.substring(firstChar);
  }
}

export function convertSecondsToTimestamp(totalSeconds: number): string {
  let truncated = Math.round(totalSeconds);

  const hours = Math.floor(truncated / 3600);
  truncated %= 3600;
  const minutes = Math.floor(truncated / 60);
  const SS = zeroPad(truncated % 60);

  if (hours > 0) {
    return hours.toString() + ":" + zeroPad(minutes) + ":" + SS;
  } else {
    return minutes.toString() + ":" + SS;
  }
}

function zeroPad(someNumber: number): string {
  if (someNumber == 0) {
    return "00";
  } else {
    return someNumber < 10
      ? "0" + someNumber.toString()
      : someNumber.toString();
  }
}

/**
 * Assumes that both timestamps come from the same speaker.
 * Bad assumption in general, but okay for now.
 */
export function getCut(
  fact: FT.VideoFactContent,
  cut: ClipRange
): [FT.Speaker, string] {
  const { text, turn } = getTurnFromClipRange(fact, cut);
  const speaker = fact.speakers[fact.turnSpeaker[turn]];
  return [speaker, text];
}

type TurnInfo = {
  turn: number;
  text: string;
  cut: CharOffsetRange;
};
function getTurnFromClipRange(
  fact: FT.VideoFactContent,
  cut: ClipRange
): TurnInfo {
  const wordStart = bsRoundEarly(fact.wordTime, cut[0]);
  let wordEnd = bsRoundEarly(fact.wordTime, cut[1]) + 1;
  if (fact.wordTime[wordEnd]) {
    --wordEnd;
  }
  const firstCharOfCut = fact.wordChar[wordStart];
  const lastCharOfCut = fact.wordChar[wordEnd] - 1;
  const text = fact.plainText.slice(firstCharOfCut, lastCharOfCut);
  const turn = bsRoundEarly(fact.turnWord, wordStart);
  const firstWordOfTurn = fact.turnWord[turn];
  const firstCharOfTurn = fact.wordChar[firstWordOfTurn];
  return {
    cut: [firstCharOfCut - firstCharOfTurn, lastCharOfCut - firstCharOfTurn],
    text,
    turn,
  };
}

export function cutToTurn(
  videoCut: VideoCut,
  videoFact: FT.VideoFactContent
): VideoTurn {
  const turnInfo = getTurnFromClipRange(videoFact, videoCut.cut);
  return {
    cut: turnInfo.cut,
    fact: videoCut.fact,
    kind: "videoTurn",
    turn: turnInfo.turn,
  };
}

export function turnToCut(
  videoTurn: VideoTurn,
  videoFact: FT.VideoFactContent
): VideoCut {
  const firstWordOfTurn = videoFact.turnWord[videoTurn.turn];
  const firstCharOfRange = videoFact.wordChar[firstWordOfTurn];
  const wordStart = bsRoundEarly(
    videoFact.wordChar,
    firstCharOfRange + videoTurn.cut[0]
  );
  const wordEnd = bsRoundEarly(
    videoFact.wordChar,
    firstCharOfRange + videoTurn.cut[1]
  );
  const clipStart = videoFact.wordTime[wordStart];
  let clipEnd;
  if (videoFact.wordTime[wordEnd + 1]) {
    clipEnd = videoFact.wordTime[wordEnd + 1];
  } else {
    clipEnd = videoFact.wordTime[wordEnd] + 2;
  }
  return {
    cut: [clipStart, clipEnd],
    fact: videoTurn.fact,
    kind: "videoCut",
  };
}

interface SeachHitContent {
  text: string;
  isHighlighted: boolean;
}

export function getHighlightedContent(
  videoTurn: VideoTurn,
  videoFact: FT.VideoFactContent,
  maxLength?: number
): SeachHitContent[] {
  const searchHitContents: SeachHitContent[] = [];
  let turnContent = getTurnContent(videoTurn.turn, videoFact);
  let contentStartIdx = videoTurn.cut[0];
  if (maxLength && videoTurn.cut[1] - videoTurn.cut[0] > maxLength) {
    turnContent = abbreviate(turnContent, maxLength + contentStartIdx);
  }
  videoTurn.bold?.forEach((highlight) => {
    const textBeforeHighlight = turnContent.substring(
      contentStartIdx,
      highlight[0]
    );
    const textOfHighlight = turnContent.substring(highlight[0], highlight[1]);
    if (textBeforeHighlight) {
      searchHitContents.push({
        text: textBeforeHighlight,
        isHighlighted: false,
      });
    }
    if (textOfHighlight) {
      searchHitContents.push({
        text: textOfHighlight,
        isHighlighted: true,
      });
    }
    contentStartIdx = highlight[1];
  });
  const textAfterAllHighlights = turnContent.substring(
    contentStartIdx,
    videoTurn.cut[1]
  );
  if (textAfterAllHighlights) {
    searchHitContents.push({
      text: textAfterAllHighlights,
      isHighlighted: false,
    });
  }
  return searchHitContents;
}

export function getSpeaker(
  videoTurn: VideoTurn,
  videoFact: FT.VideoFactContent
): string {
  const fullName =
    videoFact.speakers[videoFact.turnSpeaker[videoTurn.turn]].fullName;
  return fullName.substring(fullName.lastIndexOf(" "));
}
