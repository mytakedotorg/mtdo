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
import { Foundation } from "../../common/foundation";
import { groupBy } from "../../common/functions";
import { VideoTurn } from "../../common/social/social";
import { getTurnContent } from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { Search } from "../../java2ts/Search";
import { get } from "../../network";
import { TurnFinder, Highlight } from "./searchUtils";
import { hash } from "./search-index.json";
import {
  FACTSET_BY_HASH,
  factsetHash,
  DEBATES_HASH,
} from "../../common/factsets";

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

const SEARCH_ROUTE = `${Routes.API_SEARCH}?${Search.HASH}=${hash}&${Search.QUERY}=`;
export async function search(
  searchQuery: string,
  mode = SearchMode.Containing,
  searchDomain = ""
): Promise<SearchResult> {
  const factResults = await get<Search.FactResultList>(
    `${searchDomain}${SEARCH_ROUTE}${encodeURIComponent(searchQuery)}`
  );
  const byFactset = groupBy(factResults.facts, (fact) =>
    factsetHash(fact.hash)
  );
  const facts = await Foundation.fetchAll(
    byFactset.get(DEBATES_HASH)!.map((fact) => fact.hash)
  );
  return _searchImpl(
    new _SearchWithData(searchQuery, factResults.facts, facts, mode)
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
              bold: m.highlights.map((h) => [h[0], h[1]]),
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

export class SearchHit {
  // Offsets are relative to the beginning of the turn
  constructor(
    readonly highlightOffsets: Array<Highlight>,
    readonly videoFact: FT.VideoFactContent,
    readonly videoTurn: VideoTurn
  ) {}
}
