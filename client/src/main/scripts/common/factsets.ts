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
export interface Factset {
  title: string;
  indexBlobSha: string;
}

export interface FactsetByHash {
  [hash: string]: Factset;
}

export const FACTSET_BY_HASH: FactsetByHash = {
  E74aoUY: {
    title: "U.S. Presidential Debates",
    // git hash-object sausage/index.json
    indexBlobSha: "eda4841851a8236ed4ae534eb6b44c421f5a80bf",
  },
};

export function factsetTitleFor(factHash: string): string {
  const factsetHash = factHash.slice(0, factHash.indexOf("="));
  return FACTSET_BY_HASH[factsetHash].title;
}
