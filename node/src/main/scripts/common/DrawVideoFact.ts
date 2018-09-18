import * as React from "react";
var base64toArrayBuffer = require("base64-arraybuffer");
var bs = require("binary-search");
import { Foundation } from "../../../../../client/src/main/scripts/java2ts/Foundation";

declare global {
  interface Process {
    release: {
      name: string;
    };
  }
}

export const drawSpecs = Object.freeze({
  textMargin: 16,
  width: 500,
  linewidth: 468,
  lineheight: 1.5 //multiplier
});

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

// if ((typeof process !== 'undefined') && (process.release.name === 'node')) {

export function decodeVideoFactFromStr(
  str: string
): Foundation.VideoFactContent {
  const raw = JSON.parse(str);
  return decodeVideoFact(raw);
}

export function decodeVideoFact(
  encoded: Foundation.VideoFactContentEncoded
): Foundation.VideoFactContent {
  const data: ArrayBuffer = base64toArrayBuffer.decode(encoded.data);
  // TODO: data is little-endian.  If the user's browser is big-endian,
  // the decoding will be invalid.  Someday we should detect if the
  // browser is big-endian, and do an endian-swap if it is.  No point
  // doing this until/if we actually have a big-endian device to test
  // with.

  var offset = 0;
  const charOffsets = new Int32Array(data, offset, encoded.numWords);
  offset += encoded.numWords * Int32Array.BYTES_PER_ELEMENT;
  const timestamps = new Float32Array(data, offset, encoded.numWords);
  offset += encoded.numWords * Float32Array.BYTES_PER_ELEMENT;
  const speakerPerson = new Int32Array(
    data,
    offset,
    encoded.numSpeakerSections
  );
  offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT;
  const speakerWord = new Int32Array(data, offset, encoded.numSpeakerSections);
  offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT;
  if (offset != data.byteLength) {
    throw Error("Sizes don't match");
  }
  return {
    fact: encoded.fact,
    durationSeconds: encoded.durationSeconds,
    youtubeId: encoded.youtubeId,
    speakers: encoded.speakers,
    plainText: encoded.plainText,
    charOffsets: charOffsets,
    timestamps: timestamps,
    speakerPerson: speakerPerson,
    speakerWord: speakerWord
  };
}

export function drawVideoFact(
  canvas: HTMLCanvasElement,
  factContent: Foundation.VideoFactContent,
  highlightedRange: [number, number]
): void {
  const captionNodes = getCaptionNodeArray(factContent);

  const characterRange = getCharRangeFromVideoRange(
    factContent.charOffsets,
    factContent.timestamps,
    highlightedRange
  );

  const highlightedCaptionNodes = highlightCaption(
    captionNodes,
    characterRange
  );

  let highlightedText = '"';
  for (const node of highlightedCaptionNodes) {
    if (typeof node === "object") {
      for (const subnode of node as Array<CaptionNode>) {
        if (typeof subnode === "object") {
          const { children } = subnode.props;
          if (typeof children === "string") {
            highlightedText += children;
          } else {
            const msg =
              "databaseApi: unrecognized structure of highlightedCaptionNodes";
            throw msg;
          }
        }
      }
    }
  }
  highlightedText = highlightedText.trimRight();
  highlightedText += '"';

  drawCaption(canvas, highlightedText);
}

export function drawCaption(canvas: HTMLCanvasElement, text: string): void {
  const ctx = canvas.getContext("2d");

  canvas.width = drawSpecs.width * 2;
  (canvas as any).style = {};
  canvas.style.width = drawSpecs.width + "px";

  if (ctx) {
    // Set font styles
    const textSize = 15;
    ctx.font = "Bold " + textSize.toString() + "px Merriweather";

    // Draw text once to calculate height
    const height = drawText(ctx, text, textSize).totalHeight;

    canvas.height = height * 2;
    canvas.style.height = height + "px";

    ctx.scale(2, 2);

    // Draw grey background
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, drawSpecs.width, height);
    ctx.fillStyle = "#051a38";

    // Not sure why, but font has been reset at this point, so must set it again
    ctx.font = "Bold " + textSize.toString() + "px Merriweather";
    drawText(ctx, text, textSize);
  } else {
    const errStr = "Error getting canvas context";
    throw errStr;
  }
}

export function getCaptionNodeArray(
  videoFact: Foundation.VideoFactContent
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

interface Dimensions {
  x: number;
  y: number;
  totalHeight: number;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  words: string,
  fontsize: number,
  initialX?: number,
  initialY?: number
): Dimensions {
  let wordsArr = words.split(" ");
  // Initialize variables
  let currentLineWidth = 0;
  let isFirstLine = true;
  let line = "";
  let x = initialX ? initialX : drawSpecs.textMargin;
  let y = initialY ? initialY : fontsize;
  let totalHeight = fontsize;

  for (const word of wordsArr) {
    if (isFirstLine && initialX) {
      // Need to include width of previous line in this case
      currentLineWidth = ctx.measureText(line + word).width + initialX;
    } else {
      currentLineWidth = ctx.measureText(line + word).width;
    }

    if (currentLineWidth > drawSpecs.linewidth) {
      // Start a new line
      if (isFirstLine) {
        if (!initialX) {
          y += fontsize / 2; //top margin of new paragraph
        }
        isFirstLine = false;
      } else {
        y += fontsize * drawSpecs.lineheight;
      }
      ctx.fillText(line, x, y);
      totalHeight += fontsize * drawSpecs.lineheight;
      x = drawSpecs.textMargin;
      line = word + " ";
    } else {
      line += word + " ";
    }
  }

  // Draw the last line
  if (line.length > 0) {
    if (isFirstLine) {
      if (!initialX) {
        y += fontsize / 2; //top margin of new paragraph
      }
      isFirstLine = false;
    } else {
      y += fontsize * drawSpecs.lineheight;
    }
    totalHeight += fontsize * drawSpecs.lineheight;
    ctx.fillText(line, x, y);
    x = drawSpecs.textMargin;
  }

  totalHeight += fontsize / 2; // add bottom margin

  let finalLineWidth;
  if (initialX) {
    finalLineWidth =
      ctx.measureText(line).width + initialX - drawSpecs.textMargin;
  } else {
    finalLineWidth = ctx.measureText(line).width;
  }

  return {
    x: finalLineWidth,
    y: y,
    totalHeight: totalHeight
  };
}
