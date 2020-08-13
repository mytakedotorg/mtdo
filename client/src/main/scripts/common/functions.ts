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
import binarySearch from "binary-search";

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

/**
 * Performs a binary search where not-exactly-found elements are rounded to the early side.
 */
export function bsRoundEarly(
  sorted: ArrayLike<number>,
  needle: number
): number {
  let idx = binarySearch(sorted, needle, (element: number, target: number) => {
    return element - target;
  });
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
