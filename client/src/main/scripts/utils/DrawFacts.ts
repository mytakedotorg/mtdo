import { ReactElement } from "react";
import { Foundation } from "../java2ts/Foundation";
import { ImageProps } from "../java2ts/ImageProps";
import {
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  highlightCaption,
  CaptionNode,
  FoundationNode
} from "../common/CaptionNodes";

export const drawSpecs = Object.freeze({
  textMargin: 16,
  width: 500,
  linewidth: 468,
  lineheight: 1.5 //multiplier
});

export function drawVideoFact(
  canvas: HTMLCanvasElement,
  factContent: Foundation.VideoFactContent,
  highlightedRange: [number, number]
): ImageProps {
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

  return drawCaption(canvas, highlightedText);
}

export function drawCaption(
  canvas: HTMLCanvasElement,
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

    return {
      dataUri: canvas.toDataURL("image/png"),
      width: drawSpecs.width.toString(),
      height: height.toString()
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

export function drawDocumentText(
  ctx: CanvasRenderingContext2D,
  nodes: FoundationNode[],
  title: string
): number {
  // Draw fact title
  const titleSize = 20;
  let textSize = titleSize;
  ctx.font = "Bold " + textSize.toString() + "px Source Sans Pro";
  let x = drawSpecs.textMargin;
  let y = textSize;
  ctx.fillText(title, x, y);

  for (const node of nodes) {
    if (node.component === "h2") {
      // Set the font style
      textSize = 22.5;
      ctx.font = "Bold " + textSize.toString() + "px Merriweather";

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
            ctx.font = "Bold " + textSize.toString() + "px Merriweather";
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

export function drawDocument(
  canvas: HTMLCanvasElement,
  nodes: FoundationNode[],
  title: string
): ImageProps {
  const ctx = canvas.getContext("2d");

  canvas.width = drawSpecs.width * window.devicePixelRatio;
  canvas.style.width = drawSpecs.width + "px";

  if (ctx) {
    // Draw the document once to calculate height
    const height = drawDocumentText(ctx, [...nodes], title);

    canvas.height = height * window.devicePixelRatio;
    canvas.style.height = height + "px";

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

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
      height: height.toString()
    };
  } else {
    const errStr = "Error getting canvas context";
    throw errStr;
  }
}
