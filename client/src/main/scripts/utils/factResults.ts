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
