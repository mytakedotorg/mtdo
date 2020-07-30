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
import { Foundation } from "../../../java2ts/Foundation";
import { Routes } from "../../../java2ts/Routes";
import { Search } from "../../../java2ts/Search";
import { postRequestReturningPromise } from "../../../utils/databaseAPI";
import { FoundationData } from "../../../utils/foundationData/FoundationData";
import { FoundationDataBuilder } from "../../../utils/foundationData/FoundationDataBuilder";

class SearchResult {
  constructor(
    private _factTurns: VideoFactsToTurns[],
    private _searchTerm: string
  ) {}

  get factTurns() {
    return this._factTurns;
  }

  get searchTerm() {
    return this._searchTerm;
  }
}

// What's the advantage of this class instead of having the `search` function call `searchImpl` directly?
class SearchWithData {
  constructor(
    public searchTerm: string,
    public videoResults: Search.VideoResult[],
    public foundationData: FoundationData
  ) {}
}

export async function search(searchTerm: string): Promise<SearchResult> {
  const bodyJson: Search.Request = {
    q: searchTerm,
  };
  const factResults: Search.FactResultList = await postRequestReturningPromise(
    Routes.API_SEARCH,
    bodyJson
  );

  const builder = new FoundationDataBuilder(); // This should probably live elsewhere
  factResults.facts.forEach((fact) => builder.add(fact.hash));
  const foundationData = await builder.build();
  return searchImpl(
    new SearchWithData(searchTerm, factResults.facts, foundationData)
  );
}

function searchImpl(searchWithData: SearchWithData): SearchResult {
  const { foundationData, searchTerm, videoResults } = searchWithData;
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
  return new SearchResult(videoFactsToTurns, searchTerm);
}

export type HashesToTurns = Map<string, number[]>;

export interface VideoFactsToTurns {
  videoFact: Foundation.VideoFactContent;
  turns: number[];
}

export const createHashesToTurns = (
  facts: Search.VideoResult[]
): HashesToTurns => {
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
