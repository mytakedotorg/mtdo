const fs = require("fs");
import { Foundation } from "../../../../../client/src/main/scripts/java2ts/Foundation";

interface HashToFact {
  [hash: string]: Foundation.DocumentFactContent | Foundation.VideoFactContent;
}

const factHashMap = class FactHashMap {
  private hashesToFacts: HashToFact;
  constructor() {
    const dataDir =
      __dirname +
      "/../../../../../foundation/src/main/resources/foundation-data/";
    const index =
      __dirname +
      "/../../../../../foundation/src/main/resources/foundation-index-hash.json";
    fs.readFile(index, "UTF-8", (err: Error, data: string) => {
      const indexPointer: Foundation.IndexPointer = JSON.parse(data);
      const indexHash = indexPointer.hash;
      fs.readdir(dataDir, (err: Error, data: string[]) => {
        if (err) {
          throw err;
        }
        // Create a map of hash to FactContent
        const promises: Promise<
          Foundation.DocumentFactContent | Foundation.VideoFactContent
        >[] = [];
        let hashesToFacts: HashToFact = {};
        for (let file of data) {
          const hash = file.substring(0, file.lastIndexOf(".")); // Remove .json
          if (hash != indexHash) {
            promises.push(
              new Promise((resolve, reject) => {
                fs.readFile(
                  dataDir + file,
                  "UTF-8",
                  (err: Error, data: string) => {
                    if (err) {
                      reject(err);
                    } else {
                      const json:
                        | Foundation.DocumentFactContent
                        | Foundation.VideoFactContent = JSON.parse(data);
                      hashesToFacts[hash] = json;
                      resolve(json);
                    }
                  }
                );
              })
            );
          }
        }
        Promise.all(promises).then(factList => {
          // All facts have been loaded
          this.hashesToFacts = hashesToFacts;
        });
      });
    });
  }
  getMap(): HashToFact {
    return this.hashesToFacts;
  }
};

module.exports = factHashMap;
