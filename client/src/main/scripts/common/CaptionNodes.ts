/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import * as React from "react";
var bs = require("binary-search");
import { FT } from "../java2ts/FT";
export type CaptionNodeArr = Array<CaptionNode | Array<CaptionNode>>;

export type CaptionNode =
  | string
  | React.DetailedReactHTMLElement<
      {
        className: string;
        children?: React.ReactNode;
      },
      HTMLElement
    >;

export interface FoundationNode {
  component: string;
  offset: number;
  innerHTML: Array<string | React.ReactNode>;
}

export function getCaptionNodeArray(
  videoFact: FT.VideoFactContent
): Array<string> {
  let output: Array<string> = [];
  let prevOffset = 0;

  for (let n = 1; n < videoFact.speakerWord.length; n++) {
    let wordIdx = videoFact.speakerWord[n];
    let charOffset = videoFact.charOffsets[wordIdx];
    let innerHTML = videoFact.plainText.substring(prevOffset, charOffset);
    output.push(innerHTML);
    prevOffset = charOffset;
  }

  return output;
}

export function getCharRangeFromVideoRange(
  charOffsets: ArrayLike<number>,
  timeStamps: ArrayLike<number>,
  timeRange: [number, number]
): [number, number] {
  const startTime = timeRange[0];
  const endTime = timeRange[1];

  const comparator = (element: number, needle: number) => {
    return element - needle;
  };

  let firstWordIdx = bs(timeStamps, startTime, comparator);

  if (firstWordIdx < 0) {
    firstWordIdx = -firstWordIdx - 2;
    if (firstWordIdx < 0) {
      // If still negative, it means we're at the first word
      firstWordIdx = 0;
    }
  }

  let lastWordIdx = bs(timeStamps, endTime, comparator);

  if (lastWordIdx < 0) {
    lastWordIdx = -lastWordIdx - 2;
    if (lastWordIdx < 0) {
      // If still negative, it means we're at the first word
      lastWordIdx = 0;
    }
  }

  const startCharIndex = charOffsets[firstWordIdx];
  const endCharIndex = charOffsets[lastWordIdx + 1];

  return [startCharIndex, endCharIndex];
}

export function highlightCaption(
  nodes: string[],
  range: [number, number]
): CaptionNodeArr {
  const foundationClassName = "document__text--selected";
  let charCount = 0;
  const newNodes: CaptionNodeArr = [];
  let isFirstNodeWithHighlights = true;
  let isFinished = false;
  for (const node of nodes) {
    const nodeLength = node.length;
    if (charCount + nodeLength <= range[0]) {
      // Before the range start, output is same as input
      charCount += nodeLength;
      newNodes.push(node);
      continue;
    }
    if (isFirstNodeWithHighlights) {
      isFirstNodeWithHighlights = false;
      const startOffset = range[0] - charCount;
      const textBefore = node.substring(0, startOffset);
      if (charCount + nodeLength <= range[1]) {
        charCount += nodeLength;
        const textContent = node.substring(startOffset);
        // First span
        const newSpan = React.createElement(
          "span",
          { className: foundationClassName, key: "someKey" },
          textContent
        );

        const newNode = [textBefore, newSpan];
        newNodes.push(newNode);
        continue;
      } else {
        // A single node contains the full range
        const endOffset = range[1] - charCount;
        charCount += nodeLength;
        const textContent = node.substring(startOffset, endOffset);
        const textAfter = node.substring(endOffset);

        const newSpan = React.createElement(
          "span",
          { className: foundationClassName, key: "someKey" },
          textContent
        );

        const newNode = [textBefore, newSpan, textAfter];
        newNodes.push(newNode);
        isFinished = true;
        continue;
      }
    }
    if (charCount + nodeLength <= range[1] && !isFinished) {
      charCount += nodeLength;

      const newSpan = React.createElement(
        "span",
        { className: foundationClassName, key: "someKey" },
        node
      );

      newNodes.push([newSpan]);
      continue;
    } else if (!isFinished) {
      const endOffset = range[1] - charCount;
      const textContent = node.substring(0, endOffset);
      const textAfter = node.substring(endOffset);

      const newSpan = React.createElement(
        "span",
        { className: foundationClassName, key: "someKey" },
        textContent
      );

      const newNode = [newSpan, textAfter];
      newNodes.push(newNode);
      isFinished = true;
    } else {
      newNodes.push(node);
    }
  }
  return newNodes;
}
