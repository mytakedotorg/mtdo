/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
const binarySearch = require("binary-search");

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") //replace spaces with hyphens
    .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}

/**
 * groups values by any arbitrary key.
 * can't be replaced by _.groupBy because _ is constrained to string keys
 */
export function groupBy<K, V>(list: V[], keyGetter: (k: V) => K): Map<K, V[]> {
  const map = new Map<K, V[]>();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function bsRoundEarlyHelper(idx: number): number {
  if (idx == -1) {
    // the element would be inserted before the first element
    return 0;
  } else if (idx < 0) {
    // the element would be inserted somewhere besides the very beginning, and we'll round early
    // so if it would be inserted after x, we'll just return x
    return -idx - 2;
  } else {
    // we got very lucky, and found the exact right spot
    return idx;
  }
}

/**
 * Performs a binary search where not-exactly-found elements are rounded to the early side.
 * Can't be replaced by _.sortedIndex() because we want to round to early side
 */
export function bsRoundEarly(
  sorted: ArrayLike<number>,
  needle: number
): number {
  return bsRoundEarlyHelper(
    binarySearch(sorted, needle, (element: number, target: number) => {
      return element - target;
    })
  );
}

/**
 * Performs a binary search where not-exactly-found elements are rounded to the early side.
 * Can't be replaced by _.sortedIndex() because we want to round to early side.
 * Can't be replaced by _.sortedIndexBy() because we only want to map the haystack, not the needle
 */
export function bsRoundEarlyMapped<T>(
  sorted: ArrayLike<T>,
  needle: number,
  mapper: (arg0: T) => number
): number {
  return bsRoundEarlyHelper(
    binarySearch(sorted, needle, (element: T, target: number) => {
      return mapper(element) - target;
    })
  );
}

export function abbreviate(inStr: string, maxLength: number): string {
  if (inStr.length <= maxLength) {
    return inStr;
  }
  const lastWhiteSpaceIndex = inStr.lastIndexOf(" ", maxLength);
  const inStrEndIndex =
    lastWhiteSpaceIndex === -1 ? maxLength : lastWhiteSpaceIndex;
  return inStr.substring(0, inStrEndIndex) + "...";
}

// https://stackoverflow.com/a/901144
export function getQueryParameterByName(name: string, url?: string) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
