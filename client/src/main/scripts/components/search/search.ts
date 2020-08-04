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
import { TurnFinder } from "./searchUtils";
var bs = require("binary-search");

export class SearchResult {
  constructor(
    public factHits: VideoFactsToSearchHits[],
    public mode: SearchMode,
    public searchQuery: string
  ) {}
}

export class _SearchWithData {
  constructor(
    public searchQuery: string,
    public videoResults: Search.VideoResult[],
    public foundationData: Foundation,
    public mode: SearchMode
  ) {}
}

export enum SearchMode {
  Containing,
  BeforeAndAfter,
}

export async function search(
  searchQuery: string,
  mode: SearchMode
): Promise<SearchResult> {
  const factResults = await get<Search.FactResultList>(
    `${Routes.API_SEARCH}?${Search.QUERY}=${encodeURIComponent(searchQuery)}`
  );
  const builder = new FoundationFetcher();
  factResults.facts.forEach((fact) => builder.add(fact.hash));
  const foundationData = await builder.build();
  return _searchImpl(
    new _SearchWithData(searchQuery, factResults.facts, foundationData, mode)
  );
}

export function _searchImpl(searchWithData: _SearchWithData): SearchResult {
  const { foundationData, mode, searchQuery, videoResults } = searchWithData;
  const groupedByFactMap = groupBy(videoResults, result => result.hash);
  const groupedByFact = Array.from(groupedByFactMap.values());
  const turnFinder = new TurnFinder(searchQuery);
  const hitsPerFact = groupedByFact.map(turns => {
    const videoFact = foundationData.getVideo(turns[0].hash);
    turns.sort((a, b) => a.turn - b.turn);    
    return turns.flatMap(t => {
      const turnWithResults = turnFinder.findResults(
        getTurnContent(t.turn, videoFact)
      );
      const expandBy: Record<SearchMode, number> = {
        [SearchMode.Containing]: 1, // Record<> makes this exhausitive
        [SearchMode.BeforeAndAfter]: 2, // compile error if missing case
      };
       const multiHighlights = turnWithResults.expandBy(expandBy[mode]);
       return multiHighlights.map((m) => new SearchHit(m.highlights, m.cut, t.turn, videoFact));
    });
  });
  hitsPerFact.sort((aHits, bHits) => {
    const a = aHits[0].videoFact.fact.primaryDate
    const b = bHits[0].videoFact.fact.primaryDate;
    return a == b ? 0 : +(a > b) || -1;
  });
  return new SearchResult(
    hitsPerFact.map(hits => {
      return {
        videoFact: hits[0].videoFact,
        searchHits: hits
      }
    })
   , mode, searchQuery);
}

interface VideoFactsToSearchHits {
  videoFact: FT.VideoFactContent;
  searchHits: SearchHit[];
}

interface SeachHitContent {
  text: string;
  isHighlighted: boolean;
}

export class SearchHit {
  private clipRangeCache?: [number, number];
  // Offsets are relative to the beginning of the turn
  constructor(
    private highlightOffsets: Array<[number, number]>,
    public readonly hitOffsets: [number, number],
    public readonly turn: number,
    public videoFact: FT.VideoFactContent
  ) {}

  getSpeaker(): string {
    const { turn, videoFact } = this;
    const fullName = videoFact.speakers[videoFact.speakerPerson[turn]].fullName;
    return fullName.substring(fullName.lastIndexOf(" "));
  }

  getClipRange(): [number, number] {
    if (this.clipRangeCache) {
      return this.clipRangeCache;
    }
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

    this.clipRangeCache = [clipStart, clipEnd];
    return this.clipRangeCache;
  }

  getContent(): SeachHitContent[] {
    const searchHitContents: SeachHitContent[] = [];
    const { turn, videoFact } = this;
    const turnContent = getTurnContent(turn, videoFact);
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
}

function getTurnContent(turn: number, videoFact: FT.VideoFactContent): string {
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
}

function groupBy<K, V>(list: V[],  keyGetter: (k: V) => K):  Map<K,V[]>{
  const map = new Map<K,V[]>();
  list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}
