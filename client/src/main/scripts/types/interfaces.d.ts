/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
declare module "canvas";
declare module "react-youtube";
declare module "rc-slider";
declare module "*.sbv" {
  const content: any;
  export default content;
}
//Typescript type definition for:
//https://github.com/darkskyapp/binary-search
declare module "binary-search" {
  function binarySearch<A, B>(
    haystack: A[],
    needle: B,
    comparator: (a: A, b: B, index?: number, haystack?: A[]) => any,
    // Notes about comparator return value:
    // * when a<b the comparator's returned value should be:
    //   * negative number or a value such that `+value` is a negative number
    //   * examples: `-1` or the string `"-1"`
    // * when a>b the comparator's returned value should be:
    //   * positive number or a value such that `+value` is a positive number
    //   * examples: `1` or the string `"1"`
    // * when a===b
    //    * any value other than the return cases for a<b and a>b
    //    * examples: undefined, NaN, 'abc'
    low?: number,
    high?: number
  ): number; //returns index of found result or number < 0 if not found
  export default binarySearch;
}

// https://github.com/niklasvh/base64-arraybuffer/pull/9
declare module "base64-arraybuffer" {
  class Base64ArrayBuffer {
    encode(buffer: ArrayBuffer): string;
    decode(str: string): ArrayBuffer;
  }
  export default Base64ArrayBuffer;
}

declare interface String {
  startsWith(search: string, pos?: number): boolean;
  includes(searchString: string, pos?: number): boolean;
}

// This one is missing from @types/facebook-js-sdk. Declaration merging here.
declare namespace facebook {
  interface InitParams {
    autoLogAppEvents?: boolean;
  }
}
