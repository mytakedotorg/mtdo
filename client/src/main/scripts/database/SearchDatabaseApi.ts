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
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { Search } from "../java2ts/Search";
import {
  fetchFactReturningPromise,
  postRequest,
  VideoFactHashMap,
} from "../utils/databaseAPI";
import { SearchDatabase } from "./SearchDatabase";
import { reject } from "lodash";

export class SearchDatabaseApi {
  private _searchDatabase: SearchDatabase | undefined;
  private static instance: SearchDatabaseApi | undefined;
  private constructor(private searchTerm: string) {}

  static getInstance(searchTerm?: string): SearchDatabaseApi {
    if (!SearchDatabaseApi.instance) {
      if (!searchTerm) {
        throw "SearchDatabaseApi: Must provide a searchTerm when creating an instance";
      }
      SearchDatabaseApi.instance = new SearchDatabaseApi(searchTerm);
      return SearchDatabaseApi.instance;
    }
    // if (
    //   SearchDatabaseApi.instance.searchTerm &&
    //   SearchDatabaseApi.instance.searchTerm !== searchTerm
    // ) {
    //   throw "SearchDatabaseApi: cannot change search term";
    // }
    return SearchDatabaseApi.instance;
  }

  connect = (): Promise<void> => {
    return new Promise((resolve) => {
      const bodyJson: Search.Request = {
        q: this.searchTerm,
      };
      postRequest(
        Routes.API_SEARCH,
        bodyJson,
        (json: Search.FactResultList) => {
          try {
            this.getFacts(json, resolve);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  get searchDatabase() {
    if (!this._searchDatabase) {
      throw "SearchDatabaseApi: Database must be loaded before it can be accessed. Ensure connect has been called.";
    }
    return this._searchDatabase;
  }

  private getFacts(
    factList: Search.FactResultList,
    onSuccess: (value?: void | PromiseLike<void> | undefined) => void
  ) {
    const hashesToTurns = createHashMap(factList);
    if (!hashesToTurns) {
      this._searchDatabase = new SearchDatabase([], this.searchTerm);
      return;
    }
    const innerPromises: Promise<VideoFactHashMap>[] = [];
    hashesToTurns.forEach((turns, hash) => {
      innerPromises.push(fetchFactReturningPromise(hash));
    });

    Promise.all(innerPromises).then((videoFacts: VideoFactHashMap[]) => {
      const factTurns = processFacts(hashesToTurns, videoFacts);
      this._searchDatabase = new SearchDatabase(factTurns, this.searchTerm);
      onSuccess();
    });
  }

  static processFacts = (
    hashesToTurns: HashesToTurns,
    videoFacts: VideoFactHashMap[]
  ): FactTurns[] => {
    let factTurnsArr: FactTurns[] = [];
    for (const videoFact of videoFacts) {
      const turns = hashesToTurns.get(videoFact.hash);
      if (!turns) {
        throw "Expect hashesToTurns map to have a valid value for each key";
      }
      factTurnsArr.push({
        turns,
        videoFact: videoFact.videoFact,
      });
    }
    factTurnsArr.sort((aFactTurns, bFactTurns) => {
      const a = aFactTurns.videoFact.fact.primaryDate;
      const b = bFactTurns.videoFact.fact.primaryDate;
      return a == b ? 0 : +(a > b) || -1;
    });

    return factTurnsArr;
  };
}

export type HashesToTurns = Map<string, number[]>;

export interface FactTurns {
  videoFact: Foundation.VideoFactContent;
  turns: number[];
}

export const getSortedFactTurns = (
  searchResults: Search.FactResultList
): Promise<FactTurns[]> => {
  return new Promise((resolve, reject) => {
    const hashesToTurns = createHashMap(searchResults);
    if (!hashesToTurns) {
      return resolve([]);
    }
    const innerPromises: Promise<VideoFactHashMap>[] = [];
    // for (const result of hashesToTurns.keys()) {
    hashesToTurns.forEach((turns, hash) => {
      try {
        innerPromises.push(fetchFactReturningPromise(hash));
      } catch (err) {
        reject(err);
      }
    });

    Promise.all(innerPromises).then((videoFacts: VideoFactHashMap[]) => {
      resolve(processFacts(hashesToTurns, videoFacts));
    });
  });
};

export const createHashMap = (
  results: Search.FactResultList
): HashesToTurns | undefined => {
  const facts: Search.VideoResult[] = results.facts;
  if (facts.length <= 0) {
    return undefined;
  }

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

export const processFacts = (
  hashesToTurns: HashesToTurns,
  videoFacts: VideoFactHashMap[]
): FactTurns[] => {
  let factTurnsArr: FactTurns[] = [];
  for (const videoFact of videoFacts) {
    const turns = hashesToTurns.get(videoFact.hash);
    if (!turns) {
      throw "Expect hashesToTurns map to have a valid value for each key";
    }
    factTurnsArr.push({
      turns,
      videoFact: videoFact.videoFact,
    });
  }
  factTurnsArr.sort((aFactTurns, bFactTurns) => {
    const a = aFactTurns.videoFact.fact.primaryDate;
    const b = bFactTurns.videoFact.fact.primaryDate;
    return a == b ? 0 : +(a > b) || -1;
  });

  return factTurnsArr;
};
