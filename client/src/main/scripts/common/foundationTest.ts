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
import { FT } from "../java2ts/FT";
import { decodeVideoFact } from "./DecodeVideoFact";
import { Foundation, isVideo } from "./foundation";

import fs = require("fs");

export class FoundationHarness {
  private hashToContent: Map<
    string,
    FT.VideoFactContent | FT.DocumentFactContent
  > = new Map();

  loadHashFromDisk(hash: string): void {
    this.hashToContent.set(hash, AllFromDisk.fromDisk(hash));
  }

  set(hash: string, fact: FT.VideoFactContent | FT.DocumentFactContent): void {
    this.hashToContent.set(hash, fact);
  }

  build(): Foundation {
    return new Foundation(new Map(this.hashToContent));
  }

  static loadAllFromDisk(): Foundation {
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
    const builder = new FoundationHarness();
    for (const factLink of AllFromDisk.index) {
      builder.loadHashFromDisk(factLink.hash);
    }
    return builder.build();
  }
}

class AllFromDisk {
  static indexPointer: FT.IndexPointer = { hash: "" };
  static index: FT.FactLink[];
  private static hashToContent: Map<
    string,
    FT.VideoFactContent | FT.DocumentFactContent
  > = new Map();

  static fromDisk(hash: string): FT.VideoFactContent | FT.DocumentFactContent {
    let content = this.hashToContent.get(hash)!;
    if (!content) {
      const raw = JSON.parse(
        fs.readFileSync(
          `../foundation/src/main/resources/foundation-data/${hash}.json`,
          "utf8"
        )
      );
      if (isVideo(raw)) {
        content = decodeVideoFact(raw as FT.VideoFactContentEncoded);
      } else {
        content = raw as FT.DocumentFactContent;
      }
      this.hashToContent.set(hash, content);
    }
    return content;
  }
}
