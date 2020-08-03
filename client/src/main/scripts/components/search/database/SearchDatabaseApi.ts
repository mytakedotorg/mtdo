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
import { FT } from "../../../java2ts/FT";
import { Routes } from "../../../java2ts/Routes";
import { Search } from "../../../java2ts/Search";
import { get } from "../../../network";
import { FoundationData } from "../../../utils/foundationData/FoundationData";
import { FoundationDataBuilder } from "../../../utils/foundationData/FoundationDataBuilder";

export class SearchResult {
  constructor(
    public factTurns: VideoFactsToTurns[],
    public searchQuery: string
  ) {}
}

export class SearchWithData {
  constructor(
    public searchQuery: string,
    public videoResults: Search.VideoResult[],
    public foundationData: FoundationData
  ) {}
}

export async function search(searchQuery: string): Promise<SearchResult> {
  const factResults = await get<Search.FactResultList>(
    `${Routes.API_SEARCH}?${Search.QUERY}=${encodeURIComponent(searchQuery)}`
  );
  const builder = new FoundationDataBuilder();
  factResults.facts.forEach((fact) => builder.add(fact.hash));
  const foundationData = await builder.build();
  return searchImpl(
    new SearchWithData(searchQuery, factResults.facts, foundationData)
  );
}

export function searchImpl(searchWithData: SearchWithData): SearchResult {
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
