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
import { Foundation, FoundationFetcher } from "../../common/foundation";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { Search } from "../../java2ts/Search";
import { get } from "../../network";
var bs = require("binary-search");

export class SearchResult {
  constructor(
    public factTurns: VideoFactsToTurns[],
    public searchQuery: string
  ) {}
}

export class _SearchWithData {
  constructor(
    public searchQuery: string,
    public videoResults: Search.VideoResult[],
    public foundationData: Foundation
  ) {}
}

export async function search(searchQuery: string): Promise<SearchResult> {
  const factResults = await get<Search.FactResultList>(
    `${Routes.API_SEARCH}?${Search.QUERY}=${encodeURIComponent(searchQuery)}`
  );
  const builder = new FoundationFetcher();
  factResults.facts.forEach((fact) => builder.add(fact.hash));
  const foundationData = await builder.build();
  return _searchImpl(
    new _SearchWithData(searchQuery, factResults.facts, foundationData)
  );
}

export function _searchImpl(searchWithData: _SearchWithData): SearchResult {
  const createHashesToTurns = (facts: Search.VideoResult[]): HashesToTurns => {
    const hashesToTurns: HashesToTurns = new Map();

    facts.forEach((f) => {
      const existingTurns = hashesToTurns.get(f.hash);
      if (!existingTurns) {
        hashesToTurns.set(f.hash, [f.turn]);
      } else {
        existingTurns.push(f.turn);
      }
    });

    for (const turnList of hashesToTurns.values()) {
      turnList.sort((a, b) => a - b);
    }
    return hashesToTurns;
  };

  const { foundationData, searchQuery, videoResults } = searchWithData;
  const hashesToTurns = createHashesToTurns(videoResults);
  const videoFactsToTurns: VideoFactsToTurns[] = [];
  for (const [hash, turns] of hashesToTurns) {
    const videoFact = foundationData.getVideo(hash);
    turns.sort((a, b) => a - b);
    videoFactsToTurns.push({
      turns,
      videoFact,
    });
  }
  videoFactsToTurns.sort((aFactTurns, bFactTurns) => {
    const a = aFactTurns.videoFact.fact.primaryDate;
    const b = bFactTurns.videoFact.fact.primaryDate;
    return a == b ? 0 : +(a > b) || -1;
  });
  return new SearchResult(videoFactsToTurns, searchQuery);
}

type HashesToTurns = Map<string, number[]>;

interface VideoFactsToTurns {
  videoFact: FT.VideoFactContent;
  turns: number[];
}

interface SeachHitContent {
  text: string;
  isHighlighted: boolean;
}

class SearchHit {
  constructor(
    private highlightOffsets: Array<[number, number]>,
    private hitOffsets: [number, number],
    private turn: number,
    private videoFact: FT.VideoFactContent
  ) {}

  getSpeaker(): string {
    const { turn, videoFact } = this;
    const fullName = videoFact.speakers[videoFact.speakerPerson[turn]].fullName;
    return fullName.substring(fullName.lastIndexOf(" "));
  }

  getClipRange(): [number, number] {
    const { hitOffsets, turn, videoFact } = this;
    const veryFirstWord = videoFact.speakerWord[turn];
    const firstChar = videoFact.charOffsets[veryFirstWord];
    let firstWord = bs(
      videoFact.charOffsets, // haystack
      firstChar + hitOffsets[0], // needle
      (element: number, needle: number) => {
        return element - needle;
      }
    );

    // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
    if (firstWord < 0) {
      firstWord = -firstWord - 2;
    }

    const clipStart = videoFact.timestamps[firstWord];

    let lastWord = bs(
      videoFact.charOffsets, // haystack
      firstChar + hitOffsets[1], // needle
      (element: number, needle: number) => {
        return element - needle;
      }
    );

    // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
    if (lastWord < 0) {
      lastWord = -lastWord - 2;
    }

    let clipEnd;
    if (videoFact.timestamps[lastWord + 1]) {
      clipEnd = videoFact.timestamps[lastWord + 1];
    } else {
      clipEnd = videoFact.timestamps[lastWord] + 2;
    }

    return [clipStart, clipEnd];
  }

  getContent(): SeachHitContent[] {
    const searchHitContents: SeachHitContent[] = [];
    const turnContent = this.getTurnContent();
    let contentStartIdx = this.hitOffsets[0];
    this.highlightOffsets.forEach((highlight) => {
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
      this.hitOffsets[1]
    );
    if (textAfterAllHighlights) {
      searchHitContents.push({
        text: textAfterAllHighlights,
        isHighlighted: false,
      });
    }
    return searchHitContents;
  }

  private getTurnContent = (): string => {
    const { turn, videoFact } = this;
    let fullTurnText;
    const firstWord = videoFact.speakerWord[turn];
    const firstChar = videoFact.charOffsets[firstWord];

    if (videoFact.speakerWord[turn + 1]) {
      const lastWord = videoFact.speakerWord[turn + 1];
      const lastChar = videoFact.charOffsets[lastWord] - 1;
      fullTurnText = videoFact.plainText.substring(firstChar, lastChar);
    } else {
      // Result is in last turn
      fullTurnText = videoFact.plainText.substring(firstChar);
    }
    return fullTurnText;
  };
}
