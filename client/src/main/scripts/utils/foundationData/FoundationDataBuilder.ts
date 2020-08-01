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
import { Routes } from "../../java2ts/Routes";
import { decodeVideoFact } from "../../common/DecodeVideoFact";
import { alertErr } from "../functions";

type FactHashMap = [
  string,
  Foundation.VideoFactContent | Foundation.DocumentFactContent
];

export class FoundationDataBuilder {
  requestedFacts: Set<string> = new Set();

  add(hash: string): void {
    this.requestedFacts.add(hash);
  }

  async build(): Promise<FoundationData> {
    const promises: Promise<FactHashMap>[] = [];
    for (const hash of this.requestedFacts) {
      promises.push(this.getFact(hash));
    }
    return new FoundationData(new Map(await Promise.all(promises)));
  }

  private getFact(factHash: string): Promise<FactHashMap> {
    const headers = new Headers();

    headers.append("Accept", "application/json");

    const request: RequestInit = {
      method: "GET",
      headers: headers,
      cache: "default",
    };

    return fetch(Routes.FOUNDATION_DATA + "/" + factHash + ".json", request)
      .then(function (response: Response) {
        validateResponse(response, Routes.FOUNDATION_DATA);
        return response.json();
      })
      .then(function (
        json:
          | Foundation.VideoFactContentEncoded
          | Foundation.DocumentFactContent
      ) {
        return [factHash, isVideo(json) ? decodeVideoFact(json) : json];
      });
  }
}

export const validateResponse = (response: Response, route: string) => {
  const contentType = response.headers.get("content-type");
  if (
    !contentType ||
    contentType.indexOf("application/json") === -1 ||
    !response.ok
  ) {
    const msg = `Unexpected response from ${route}.`;
    alertErr(msg);
    throw msg;
  }
};
