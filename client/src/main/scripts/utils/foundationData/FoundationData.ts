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
import { FT } from "../../java2ts/FT";

export class FoundationData {
  constructor(
    private hashToContent: Map<
      string,
      FT.VideoFactContent | FT.DocumentFactContent
    >
  ) {}

  getDocument(hash: string): FT.DocumentFactContent {
    const content = this.hashToContent.get(hash);
    if (isDocument(content)) {
      return content;
    }
    throw `Content of hash ${hash} is not a document or is not loaded.`;
  }

  getVideo(hash: string): FT.VideoFactContent {
    const content = this.hashToContent.get(hash);
    if (isVideo(content)) {
      return content;
    }
    throw `Content of hash ${hash} is not a video or is not loaded.`;
  }

  getFactContent(hash: string): FT.VideoFactContent | FT.DocumentFactContent {
    const content = this.hashToContent.get(hash);
    if (content) {
      return content;
    }
    throw `Content of hash ${hash} is not loaded.`;
  }
}

type VideoContent = FT.VideoFactContent | FT.VideoFactContentEncoded;
export function isVideo(fact?: FT.FactContent | null): fact is VideoContent {
  if (fact) {
    return (fact as VideoContent).fact.kind === "video";
  } else {
    return false;
  }
}

export function isDocument(
  fact?: FT.DocumentFactContent | FT.VideoFactContent | null
): fact is FT.DocumentFactContent {
  if (fact) {
    return (fact as FT.DocumentFactContent).fact.kind === "document";
  } else {
    return false;
  }
}
