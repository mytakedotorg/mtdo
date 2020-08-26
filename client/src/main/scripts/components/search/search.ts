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
import { abbreviate, groupBy } from "../../common/functions";
import { VideoTurn } from "../../common/social/social";
import { getTurnContent } from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { Search } from "../../java2ts/Search";
import { get } from "../../network";
import { TurnFinder } from "./searchUtils";

export class SearchResult {
  constructor(
    public factHits: VideoFactsToSearchHits[],
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

  /**
   * Map of fact hashes to an array of video results. e.g.:
   *
   * {
   *   key: "abc",
   *   value: [
   *     {turn: 1, hash: "abc"},
   *     {turn: 2, hash: "abc"}
   *   ]
   * },
   * {
   *   key: "def",
   *   value: [
   *     {turn: 1, hash: "def"},
   *     {turn: 2, hash: "def"}
   *   ]
   * }
   */
  const groupedByFactMap = groupBy(videoResults, (result) => result.hash);

  /**
   * Array of video result arrays, grouped by fact. e.g.:
   *
   * [
   *   [
   *     {turn: 1, hash: "abc"},
   *     {turn: 2, hash: "abc"}
   *   ],
   *   [
   *     {turn: 1, hash: "def"},
   *     {turn: 2, hash: "def"}
   *   ]
   * ]
   */
  const groupedByFact = Array.from(groupedByFactMap.values());
  const turnFinder = new TurnFinder(searchQuery);

  // Array of SearchHit arrays, grouped by fact
  const hitsPerFact = groupedByFact
    .map((videoResults) => {
      const hash = videoResults[0].hash;
      const videoFact = foundationData.getVideo(hash);
      // Sort hits by turn
      videoResults.sort((a, b) => a.turn - b.turn);
      return videoResults.flatMap((v) => {
        const turnWithResults = turnFinder.findResults(
          getTurnContent(v.turn, videoFact)
        );
        const expandBy: Record<SearchMode, number> = {
          [SearchMode.Containing]: 1, // Record<> makes this exhausitive
          [SearchMode.BeforeAndAfter]: 2, // compile error if missing case
        };
        const multiHighlights = turnWithResults.expandBy(expandBy[mode]);
        return multiHighlights.map(
          (m) =>
            new SearchHit(m.highlights, videoFact, {
              kind: "videoTurn",
              fact: hash,
              turn: v.turn,
              cut: m.cut,
            })
        );
      });
    })
    .filter((hpf) => hpf.length > 0);
  // Sort videos by date, oldest first
  hitsPerFact.sort((aHits, bHits) => {
    const a = aHits[0].videoFact.fact.primaryDate;
    const b = bHits[0].videoFact.fact.primaryDate;
    return a == b ? 0 : +(a > b) || -1;
  });
  return new SearchResult(
    hitsPerFact.map((hits) => {
      return {
        videoFact: hits[0].videoFact,
        searchHits: hits,
      };
    }),
    searchQuery
  );
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
    readonly highlightOffsets: Array<[number, number, string]>,
    readonly videoFact: FT.VideoFactContent,
    readonly videoTurn: VideoTurn
  ) {}

  getSpeaker(): string {
    const { videoTurn, videoFact } = this;
    const fullName =
      videoFact.speakers[videoFact.turnSpeaker[videoTurn.turn]].fullName;
    return fullName.substring(fullName.lastIndexOf(" "));
  }

  getContent(maxLength?: number): SeachHitContent[] {
    const searchHitContents: SeachHitContent[] = [];
    const { videoTurn, videoFact } = this;
    const { cut, turn } = videoTurn;
    let turnContent = getTurnContent(turn, videoFact);
    let contentStartIdx = cut[0];
    if (maxLength && cut[1] - cut[0] > maxLength) {
      turnContent = abbreviate(turnContent, maxLength + contentStartIdx);
    }
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
      cut[1]
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
