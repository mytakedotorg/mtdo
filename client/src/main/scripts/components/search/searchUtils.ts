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
export interface MultiHighlight {
  cut: [number, number];
  highlights: Array<[number, number, string]>;
}
/**
 * Offsets to cut out of the turn content, along with all the offsets
 * to highlight within that content.  The highlights are relative to
 * the start of the turn's content, not the start of the cut.
 */

function cleanupRegex(str: string): string {
  const alphaNumWhitespaceOnly = str.replace("[^a-z0-9s]", "");
  return alphaNumWhitespaceOnly.replace(" ", "\\W+"); // all commas, dashes, quotes, etc. get smushed into one group
}

/** This class finds matches within a turn, returning them as TurnWithResults. */
export class TurnFinder {
  regexInclude: RegExp;
  regexIncludePerTerm: [RegExp, string][] = [];
  regexExclude?: RegExp;

  constructor(searchQuery: string) {
    let include = "";
    let exclude = "";
    for (const clause of searchQuery.toLowerCase().split(",")) {
      const trimmed = clause.trim();
      if (trimmed.length == 0) {
        continue;
      }
      if (trimmed.charAt(0) === "-") {
        exclude = exclude + "|" + cleanupRegex(trimmed.substr(1));
      } else {
        const toInclude = cleanupRegex(trimmed);
        this.regexIncludePerTerm.push([new RegExp(toInclude, "ig"), trimmed]);
        include = include + "|" + toInclude;
      }
    }
    this.regexInclude = new RegExp(include.slice(1), "ig");
    if (exclude.length > 0) {
      this.regexExclude = new RegExp(exclude.slice(1), "ig");
    }
  }

  /** Finds all the results in the given turnContent. */
  findResults(turnContent: string): TurnWithResults {
    this.regexInclude.lastIndex = 0;
    let foundOffsets: Array<[number, number, string]> = [];
    let found = this.regexInclude.exec(turnContent);
    while (found != null) {
      const foundHunk = found[0];
      const foundTerm = this.regexIncludePerTerm.find((regexAndTerm) => {
        regexAndTerm[0].lastIndex = 0;
        return regexAndTerm[0].test(foundHunk);
      });
      if (foundTerm) {
        const lastIndex = found.index + foundHunk.length;

        foundOffsets.push([found.index, lastIndex, foundTerm[1]]);
        this.regexInclude.lastIndex = lastIndex + 1;
        found = this.regexInclude.exec(turnContent);
      }
    }
    if (this.regexExclude) {
      this.regexExclude.lastIndex = 0;
      let foundNegative = this.regexExclude.exec(turnContent);
      while (foundNegative != null) {
        const foundNegativeHunk = foundNegative[0];
        const lastNegativeIndex =
          foundNegative.index + foundNegativeHunk.length;
        foundOffsets = foundOffsets.filter((fo) => {
          // include only if there is no overlap between what the negate found
          // https://stackoverflow.com/a/3269471/1153071
          return !(fo[0] <= lastNegativeIndex && foundNegative!.index <= fo[1]);
        });
        this.regexExclude.lastIndex = lastNegativeIndex + 1;
        foundNegative = this.regexExclude.exec(turnContent);
      }
    }
    return new TurnWithResults(turnContent, foundOffsets);
  }
}

/**
 * Contains the offsets of every word that was found.
 * Use "expandBy" to find the MultiHighlight that would
 * contain more sentences.
 */
class TurnWithResults {
  turnContent: string;
  foundOffsets: Array<[number, number, string]>;

  constructor(
    turnContent: string,
    foundOffsets: Array<[number, number, string]>
  ) {
    this.turnContent = turnContent;
    this.foundOffsets = foundOffsets;
  }

  /** Returns the MultiHighlights with the given amount of padding around the found words. */
  expandBy(numSentencesBuffer: number): MultiHighlight[] {
    let multiHighlights: MultiHighlight[] = [];

    for (var found of this.foundOffsets) {
      // initialize around the found word
      let start = this.prevPunc(found[0]);
      let end = this.nextPunc(found[1]);
      // expand a few more times
      for (var i = 1; i < numSentencesBuffer; ++i) {
        start = this.prevPunc(start - 5);
        end = this.nextPunc(end + 5);
      }
      // if we overlap with the previous highlight, expand it to include our stuff
      let lastHighlight =
        multiHighlights.length == 0
          ? null
          : multiHighlights[multiHighlights.length - 1];
      if (lastHighlight != null && lastHighlight.cut[1] >= start) {
        lastHighlight.cut[1] = end;
        lastHighlight.highlights.push(found);
      } else {
        // else create a new highlight
        multiHighlights.push({
          cut: [start, end],
          highlights: [found],
        });
      }
    }
    return multiHighlights;
  }

  /**
   * Returns the beginning of the sentence, e.g.
   *           v if searching for she
   * "Hello!", she said.
   *    Hello. That's what she said.
   */
  prevPunc(start: number): number {
    if (start <= 0) {
      return 0;
    }
    let prevPeriod = this.turnContent.lastIndexOf(".", start);
    let prevQuestion = this.turnContent.lastIndexOf("?", start);
    let prevExclamation = this.turnContent.lastIndexOf("!", start);
    let firstPrev = Math.max(
      prevPeriod,
      Math.max(prevQuestion, prevExclamation)
    );
    if (firstPrev == -1) {
      return 0;
    } else {
      // Expand to end of quote for e.g. "Hello!", she said.
      // searching for "she", we want to point to the "s" in she
      let firstSpaceAfterPrev = this.turnContent.indexOf(" ", firstPrev);
      return firstSpaceAfterPrev + 1;
    }
  }

  /**
   * Returns the end of the sentence, e.g.
   *                       v if searching for "hello"
   *              "Hello!", she said.
   *                 Hello. That's what she said.
   *                 Hello!
   */
  nextPunc(start: number): number {
    if (start >= this.turnContent.length) {
      return this.turnContent.length;
    }
    var negativeToMax = (num: number) =>
      num == -1 ? this.turnContent.length : num;
    let nextPeriod = negativeToMax(this.turnContent.indexOf(".", start));
    let nextQuestion = negativeToMax(this.turnContent.indexOf("?", start));
    let nextExclamation = negativeToMax(this.turnContent.indexOf("!", start));
    let firstNext = Math.min(
      nextPeriod,
      Math.min(nextQuestion, nextExclamation)
    );
    // if none are found, then we'll return turnContent.length, which is perfect
    if (firstNext == this.turnContent.length) {
      return this.turnContent.length;
    } else {
      // expand to end of quote for e.g. "Hello!", she said.
      let firstSpace = this.turnContent.indexOf(" ", firstNext);
      if (firstSpace == -1) {
        return this.turnContent.length;
      } else {
        return firstSpace;
      }
    }
  }
}
