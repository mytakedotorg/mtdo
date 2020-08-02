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
import { ReactElement } from "react";
import { Foundation } from "../java2ts/Foundation";
import { ImageProps } from "../java2ts/ImageProps";
import {
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  highlightCaption,
  CaptionNode,
  FoundationNode,
} from "./CaptionNodes";
import { getHighlightedNodes } from "./DocumentNodes";
import { loadImage } from "../utils/loadImage";

const drawSpecs = Object.freeze({
  textMargin: 16,
  width: 480,
  linewidth: 468,
  lineheight: 1.5, //multiplier
  thumbHeight: 360,
});

export function drawDocumentFact(
  canvas: HTMLCanvasElement,
  factContent: Foundation.DocumentFactContent,
  highlightedRange: [number, number],
  viewRange: [number, number]
) {
  let nodes: FoundationNode[] = [];

  for (const documentComponent of factContent.components) {
    nodes.push({
      component: documentComponent.component,
      innerHTML: [documentComponent.innerHTML],
      offset: documentComponent.offset,
    });
  }

  let highlightedNodes = getHighlightedNodes(
    [...nodes],
    highlightedRange,
    viewRange
  );

  const title = factContent.fact.title;

  drawDocument(canvas, [...highlightedNodes], title);
}

export function drawVideoFact(
  canvas: HTMLCanvasElement,
  factContent: Foundation.VideoFactContent,
  highlightedRange: [number, number]
): Promise<ImageProps> {
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

  const src = "https://img.youtube.com/vi/" + factContent.youtubeId + "/0.jpg";
  return new Promise(function (resolve, reject) {
    loadImage(src).then((img: HTMLImageElement) => {
      return resolve(drawCaption(canvas, img, highlightedText));
    });
  });
}

function drawCaption(
  canvas: HTMLCanvasElement,
  thumb: HTMLImageElement,
  text: string
): ImageProps {
  const ctx = canvas.getContext("2d");

  canvas.width = drawSpecs.width * 2;
  (canvas as any).style = {};
  canvas.style.width = drawSpecs.width + "px";

  if (ctx) {
    // Set font styles
    const textSize = 15;
    ctx.font = "Bold " + textSize.toString() + "px Merriweather";

    // Draw text once to calculate height
    const height =
      drawText(
        ctx,
        text,
        textSize,
        0,
        drawSpecs.thumbHeight + drawSpecs.textMargin
      ).totalHeight + drawSpecs.thumbHeight;

    canvas.height = height * 2;
    canvas.style.height = height + "px";

    ctx.scale(2, 2);

    // Draw grey background
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, drawSpecs.width, height);
    ctx.fillStyle = "#051a38";

    ctx.drawImage(thumb, 0, 0);

    // Not sure why, but font has been reset at this point, so must set it again
    ctx.font = "Bold " + textSize.toString() + "px Merriweather";
    drawText(
      ctx,
      text,
      textSize,
      0,
      drawSpecs.thumbHeight + drawSpecs.textMargin
    );

    return {
      dataUri: canvas.toDataURL("image/png"),
      width: drawSpecs.width.toString(),
      height: height.toString(),
    };
  } else {
    const errStr = "Error getting canvas context";
    throw errStr;
  }
}

interface Dimensions {
  x: number;
  y: number;
  totalHeight: number;
}

function drawText(
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
    totalHeight: totalHeight,
  };
}

function drawDocumentText(
  ctx: CanvasRenderingContext2D,
  nodes: FoundationNode[],
  title: string
): number {
  // Draw fact title
  const titleSize = 20;
  let textSize = titleSize;
  // ctx.font = "bold " + textSize.toString() + "px Source Sans Pro";
  ctx.font = "bold " + textSize.toString() + "px sans";
  let x = drawSpecs.textMargin;
  let y = textSize;
  ctx.fillText(title, x, y);

  for (const node of nodes) {
    if (node.component === "h2") {
      // Set the font style
      textSize = 22.5;
      ctx.font = "bold " + textSize.toString() + "px Merriweather";

      // Add a margin above the new line of text
      y += textSize * drawSpecs.lineheight;

      // Initialize an empty line of texxt
      let line = "";
      for (const text of node.innerHTML) {
        // Loop through the innerHTML array to search for React Elements
        if (text) {
          let textStr = text.toString();
          if (textStr === "[object Object]") {
            // Can't find a better conditional test
            // Found a React Element
            line += (text as ReactElement<HTMLSpanElement>).props.children;
          } else {
            line += textStr;
          }
        }
      }

      // Write the line of text at the coordinates
      ctx.fillText(line, drawSpecs.textMargin, y);
    } else if (node.component === "p") {
      // Set font size
      textSize = 15;

      // Initialize the coorindates
      x = drawSpecs.textMargin; // Left margin of text
      y += textSize * drawSpecs.lineheight * drawSpecs.lineheight; // Top margin

      // Loop through the innerHTML array to search for React Elements
      for (const text of node.innerHTML) {
        if (text) {
          let textStr = text.toString();
          let words = "";
          if (textStr === "[object Object]") {
            // Can't find a better conditional test
            // Found a React Element
            words += (text as ReactElement<HTMLSpanElement>).props.children;
            // This text is highlighted, so make it bold
            ctx.font = "bold " + textSize.toString() + "px Merriweather";
          } else {
            words += textStr.trim();
            ctx.font = textSize.toString() + "px Merriweather";
          }

          const dimensions = drawText(ctx, words, textSize, x, y);

          // Set the dimensions of the next line to be drawn where the previous line left off
          y = dimensions.y;
          x = drawSpecs.textMargin + dimensions.x;
        }
      }
      y += textSize / 2; //bottom margin
    } else {
      const errStr = "Unknown component";
      throw errStr;
    }
  }
  return y;
}

function drawDocument(
  canvas: HTMLCanvasElement,
  nodes: FoundationNode[],
  title: string
): ImageProps {
  const ctx = canvas.getContext("2d");

  canvas.width = drawSpecs.width * 2;
  (canvas as any).style = {};
  canvas.style.width = drawSpecs.width + "px";

  if (ctx) {
    // Draw the document once to calculate height
    const height = drawDocumentText(ctx, [...nodes], title);

    canvas.height = height * 2;
    canvas.style.height = height + "px";

    ctx.scale(2, 2);

    // Draw grey background
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, drawSpecs.width, height);

    // Set text color
    ctx.fillStyle = "#051a38";

    // Draw document again to draw the text
    drawDocumentText(ctx, [...nodes], title);

    return {
      dataUri: canvas.toDataURL("image/png"),
      width: drawSpecs.width.toString(),
      height: height.toString(),
    };
  } else {
    const errStr = "Error getting canvas context";
    throw errStr;
  }
}
