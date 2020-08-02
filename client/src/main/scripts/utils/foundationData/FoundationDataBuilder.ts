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
import { decodeVideoFact } from "../../common/DecodeVideoFact";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { FoundationData, isVideo } from "./FoundationData";

export class FoundationDataBuilder {
  requestedFacts: string[] = [];

  add(hash: string): void {
    if (this.requestedFacts.indexOf(hash) === -1) {
      this.requestedFacts.push(hash);
    }
  }

  async build(): Promise<FoundationData> {
    const facts = await Promise.all(
      this.requestedFacts.map((hash) => this.getFact(hash))
    );
    const map = new Map(
      this.requestedFacts.map((hash, idx) => [hash, facts[idx]])
    );
    return new FoundationData(map);
  }

  private async getFact(
    factHash: string
  ): Promise<FT.VideoFactContent | FT.DocumentFactContent> {
    const factContent = await get<FT.FactContent>(
      Routes.FOUNDATION_DATA + "/" + factHash + ".json"
    );
    if (isVideo(factContent)) {
      return decodeVideoFact(factContent as FT.VideoFactContentEncoded);
    } else {
      return factContent as FT.DocumentFactContent;
    }
  }

  static async index(): Promise<FT.FactLink[]> {
    const indexPointer = await get<FT.IndexPointer>(
      Routes.FOUNDATION_INDEX_HASH,
      "no-cache"
    );
    return get<FT.FactLink[]>(
      Routes.FOUNDATION_DATA + "/" + indexPointer.hash + ".json"
    );
  }

  static async justOneDocument(
    factHash: string
  ): Promise<FT.DocumentFactContent> {
    const builder = new FoundationDataBuilder();
    builder.add(factHash);
    return (await builder.build()).getDocument(factHash);
  }

  static async justOneVideo(factHash: string): Promise<FT.VideoFactContent> {
    const builder = new FoundationDataBuilder();
    builder.add(factHash);
    return (await builder.build()).getVideo(factHash);
  }
}

export async function get<T>(
  path: string,
  cache: RequestCache = "default"
): Promise<T> {
  const response = await fetch(
    new Request(path, {
      method: "get",
      cache: cache,
      credentials: "omit",
    })
  );
  return response.json();
}

export async function post<T, R>(path: string, body: T): Promise<R> {
  const response = await fetch(
    new Request(path, {
      method: "post",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  );
  return response.json();
}
