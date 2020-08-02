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
import { isVideo, FoundationData } from "./FoundationData";
import { Foundation } from "../../java2ts/Foundation";
import { decodeVideoFact } from "../../common/DecodeVideoFact";

import fs = require("fs");
import content from "*.sbv";

export class FoundationDataTestBuilder {
  private hashToContent: Map<
    string,
    Foundation.VideoFactContent | Foundation.DocumentFactContent
  > = new Map();

  loadHashFromDisk(hash: string): void {
    this.hashToContent.set(hash, AllFromDisk.fromDisk(hash));
  }

  set(
    hash: string,
    fact: Foundation.VideoFactContent | Foundation.DocumentFactContent
  ): void {
    this.hashToContent.set(hash, fact);
  }

  build(): FoundationData {
    return new FoundationData(new Map(this.hashToContent));
  }

  static loadAllFromDisk(): FoundationData {
    if (AllFromDisk.indexPointer.hash === "") {
      AllFromDisk.indexPointer = JSON.parse(
        fs.readFileSync(
          "../foundation/src/main/resources/foundation-index-hash.json",
          "utf8"
        )
      );
      AllFromDisk.index = JSON.parse(
        fs.readFileSync(
          `../foundation/src/main/resources/foundation-data/${AllFromDisk.indexPointer.hash}.json`,
          "utf8"
        )
      );
    }
    const builder = new FoundationDataTestBuilder();
    for (const factLink of AllFromDisk.index) {
      builder.loadHashFromDisk(factLink.hash);
      console.log(factLink.hash);
    }
    return builder.build();
  }
}

class AllFromDisk {
  static indexPointer: Foundation.IndexPointer = { hash: "" };
  static index: Foundation.FactLink[];
  private static hashToContent: Map<
    string,
    Foundation.VideoFactContent | Foundation.DocumentFactContent
  > = new Map();

  static fromDisk(
    hash: string
  ): Foundation.VideoFactContent | Foundation.DocumentFactContent {
    let content = this.hashToContent.get(hash)!;
    if (!content) {
      const raw = JSON.parse(
        fs.readFileSync(
          `../foundation/src/main/resources/foundation-data/${hash}.json`,
          "utf8"
        )
      );
      if (isVideo(raw)) {
        content = decodeVideoFact(raw as Foundation.VideoFactContentEncoded);
      } else {
        content = raw as Foundation.DocumentFactContent;
      }
      this.hashToContent.set(hash, content);
    }
    return content;
  }
}
