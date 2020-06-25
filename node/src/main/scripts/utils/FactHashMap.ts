/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
const fs = require("fs");
const axios = require("axios").default;
import { Foundation } from "../java2ts/Foundation";

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
          Promise.all(promises).then((factList) => {
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
            axios
              .get(imageURI)
              .then(function (htmlString: string) {
                vidHashesToThumbs[hash] = htmlString;
                resolveThumb(htmlString);
              })
              .catch(function (err: Error) {
                console.error("Failed to load ", imageURI);
                rejectThumb(err);
              });
          })
        );
      }
    }
    Promise.all(promises)
      .then((factList) => {
        // All facts have been loaded
        resolveLoad(vidHashesToThumbs);
      })
      .catch((err) => {
        rejectLoad(err);
      });
  });
};

export default FactHashMap;
