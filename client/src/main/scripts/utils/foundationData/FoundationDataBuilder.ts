import {
  fetchFactReturningPromise,
  FactHashMap,
} from "../../utils/databaseAPI";
import { FoundationData } from "./FoundationData";

export class FoundationDataBuilder {
  requestedFacts: Set<string> = new Set();

  add = (hash: string) => {
    this.requestedFacts.add(hash);
  };

  build = async (): Promise<FoundationData> => {
    const promises: Promise<FactHashMap>[] = [];
    for (const hash of this.requestedFacts) {
      promises.push(fetchFactReturningPromise(hash));
    }
    return new FoundationData(new Map(await Promise.all(promises)));
  };
}
