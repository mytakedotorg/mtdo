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
import { Search } from "../java2ts/Search";
import { VideoFactHashMap, fetchFactReturningPromise } from "./databaseAPI";
import { reject } from "lodash";

export type HashesToTurns = Map<string, number[]>;

export interface FactTurns {
  videoFact: Foundation.VideoFactContent;
  turns: number[];
}

export const getSortedFactTurns = (
  searchResults: Search.FactResultList
): Promise<FactTurns[]> => {
  return new Promise((resolve) => {
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
  return factTurnsArr;
};
