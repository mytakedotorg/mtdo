import { Foundation } from "../java2ts/Foundation";
import { Search } from "../java2ts/Search";
import { VideoFactHashMap, fetchFactReturningPromise } from "./databaseAPI";

interface SortedResults {
  hash: string;
  turns: number[];
}

export interface FactTurns {
  videoFact: Foundation.VideoFactContent;
  turns: number[];
}

export const getSortedFactTurns = (
  searchResults: Search.FactResultList
): Promise<FactTurns[]> => {
  const sortedResults = sortResults(searchResults);
  return new Promise((resolve) => {
    const innerPromises = [];
    for (const result of sortedResults) {
      innerPromises.push(fetchFactReturningPromise(result.hash));
    }

    Promise.all(innerPromises).then((videoFacts: VideoFactHashMap[]) => {
      resolve(processFacts(sortedResults, videoFacts));
    });
  });
};

export const sortResults = (
  results: Search.FactResultList
): SortedResults[] => {
  const facts: Search.VideoResult[] = results.facts;
  if (facts.length <= 0) {
    return [];
  }
  let sortedResults: SortedResults[] = [];
  let prevHash = facts[0].hash;
  let turns: number[] = [];
  for (const videoResult of facts) {
    if (videoResult.hash !== prevHash) {
      sortedResults.push({
        hash: prevHash,
        turns: turns,
      });
      prevHash = videoResult.hash;
      turns = [videoResult.turn];
    } else {
      turns.push(videoResult.turn);
    }
  }
  // Push last hash after loop is over
  sortedResults.push({
    hash: prevHash,
    turns: turns,
  });
  return sortedResults;
};

const processFacts = (
  searchResults: SortedResults[],
  videoFacts: VideoFactHashMap[]
): FactTurns[] => {
  let factTurnsArr: FactTurns[] = [];
  for (const videoFact of videoFacts) {
    const currentHash = videoFact.hash;
    const reducer = searchResults.reduce(
      (accumulator: SortedResults, currentValue: SortedResults) => {
        if (accumulator.hash !== currentHash) {
          // Skip accumulating until we match our hash
          return currentValue;
        }
        if (currentValue.hash === currentHash) {
          return {
            hash: currentHash,
            turns: accumulator.turns.concat(currentValue.turns),
          };
        } else {
          return accumulator;
        }
      }
    );
    factTurnsArr.push({
      turns: reducer.turns,
      videoFact: videoFact.videoFact,
    });
  }
  return factTurnsArr;
};
