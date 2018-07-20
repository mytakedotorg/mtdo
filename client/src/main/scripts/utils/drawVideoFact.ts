import {
  CaptionNode,
  decodeVideoFact,
  drawCaption,
  drawVideoFact,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  highlightCaption
} from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import { ImageProps } from "../java2ts/ImageProps";
var Canvas = require("canvas");

declare global {
  interface Process {
    release: {
      name: string;
    };
  }
}
declare var process: Process;

// if ((typeof process !== 'undefined') && (process.release.name === 'node')) {

export function decodeVideoFactFromStr(
  str: string
): Foundation.VideoFactContent {
  const raw = JSON.parse(str);
  return decodeVideoFact(raw);
}

/**
 * Client/Server function. Throws.
 *
 * @param factContent
 * @param videoBlock
 */
export function drawVideoFactNode(
  factContent: Foundation.VideoFactContent,
  highlightedRange: [number, number]
): ImageProps {
  const canvas = new Canvas();
  return drawVideoFact(canvas, factContent, highlightedRange);
}
