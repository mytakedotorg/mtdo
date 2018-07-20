import {
  CaptionNode,
  decodeVideoFact,
  drawCaption,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  highlightCaption
} from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import { ImageProps } from "../java2ts/ImageProps";

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
export function drawVideoFact(
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

  const imageProps = drawCaption(highlightedText);

  return imageProps;
}

export default { decodeVideoFactFromStr, drawVideoFact };
