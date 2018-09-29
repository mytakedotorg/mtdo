const fs = require("fs");
const request = require("request-promise");
import { Foundation } from "../../../../../client/src/main/scripts/java2ts/Foundation";

interface HashToFact {
  [hash: string]: Foundation.DocumentFactContent | Foundation.VideoFactContent;
}

interface VidHashToThumb {
  [hash: string]: string;
}

const FactHashMap = class FactHashMap {
  constructor() {}
  load() {
    return new Promise<HashToFact>((resolveLoad, rejectLoad) => {
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
            rejectLoad(err);
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
                new Promise((resolveFile, rejectFile) => {
                  fs.readFile(
                    dataDir + file,
                    "UTF-8",
                    (err: Error, data: string) => {
                      if (err) {
                        rejectFile(err);
                      } else {
                        const json:
                          | Foundation.DocumentFactContent
                          | Foundation.VideoFactContent = JSON.parse(data);
                        hashesToFacts[hash] = json;
                        resolveFile(json);
                      }
                    }
                  );
                })
              );
            }
          }
          Promise.all(promises).then(factList => {
            // All facts have been loaded
            resolveLoad(hashesToFacts);
          });
        });
      });
    });
  }
};

export const fetchYTThumbs = (
  hashesToFacts: HashToFact
): Promise<VidHashToThumb> => {
  return new Promise<VidHashToThumb>((resolveLoad, rejectLoad) => {
    let vidHashesToThumbs: VidHashToThumb = {};
    const promises: Promise<string>[] = [];
    for (const hash in hashesToFacts) {
      const factContent = hashesToFacts[hash];
      if (factContent.fact.kind === "video") {
        const imageURI =
          "https://img.youtube.com/vi/" +
          (factContent as Foundation.VideoFactContent).youtubeId +
          "/0.jpg";
        promises.push(
          new Promise((resolveThumb, rejectThumb) => {
            request(imageURI)
              .then(function(htmlString: string) {
                vidHashesToThumbs[hash] = htmlString;
                resolveThumb(htmlString);
              })
              .catch(function(err: Error) {
                rejectThumb(err);
              });
          })
        );
      }
    }
    Promise.all(promises).then(factList => {
      // All facts have been loaded
      resolveLoad(vidHashesToThumbs);
    });
  });
};

export default FactHashMap;
