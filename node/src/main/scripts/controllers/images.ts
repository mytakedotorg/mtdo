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
import { createCanvas, registerFont } from "canvas";
import { FoundationFetcher } from "../common/foundation";
import { FT } from "../java2ts/FT";
import { drawDocumentFact, drawVideoFact } from "./images-drawfacts";

registerFont("Merriweather-Regular.ttf", {
  family: "Merriweather",
  weight: "normal",
});
registerFont("Merriweather-Bold.ttf", {
  family: "Merriweather",
  weight: "bold",
});

function videoRangeFromString(rangeStr: string): [number, number] | undefined {
  if (rangeStr.startsWith("_")) {
    rangeStr = rangeStr.substring(1);
  }
  const rangeArr = rangeStr.split("-");
  if (rangeArr.length != 2) {
    return undefined;
  }
  const start = parseFloat(rangeArr[0]);
  const end = parseFloat(rangeArr[1]);
  if (isNaN(start) || isNaN(end)) {
    return undefined;
  }
  return [start, end];
}

function documentRangeFromString(
  rangeStr: string
): [number, number] | undefined {
  if (rangeStr.startsWith("_")) {
    rangeStr = rangeStr.substring(1);
  }
  const rangeArr = rangeStr.split("-");
  if (rangeArr.length != 2) {
    return undefined;
  }
  const start = parseFloat(rangeArr[0]);
  const end = parseFloat(rangeArr[1]);
  if (isNaN(start) || isNaN(end)) {
    return undefined;
  }
  return [start, end];
}

function videoFactImage(
  videoFact: FT.VideoFactContent,
  highlight: [number, number]
): string {
  const canvas = createCanvas(480, 360);
  drawVideoFact(canvas, videoFact, highlight);
  return canvas.toDataURL();
}

function documentFactImage(
  documentFact: FT.DocumentFactContent,
  highlight: [number, number],
  view: [number, number]
): string {
  const canvas = createCanvas(480, 360);
  const ctx = canvas.getContext("2d");
  drawDocumentFact(ctx.canvas, documentFact, highlight, view);
  return canvas.toDataURL();
}

export async function generateImage(
  imgKeyAndExtension: string
): Promise<Buffer | string> {
  // Expect imgKey for videos to be like "/vidId_hStart-hEnd.png
  // Expect imgKey for docs to be like "/docId_hStart-hEnd_vStart-vEnd.png
  const imgKey = imgKeyAndExtension.substring(
    0,
    imgKeyAndExtension.lastIndexOf(".")
  );
  // Must test for documents first. Documents will also pass the video regex.
  const docRegex = /_[0-9]{1,5}-[0-9]{1,5}_[0-9]{1,5}-[0-9]{1,5}$/;
  const vidRegex = /_[0-9]{4}.[0-9]{3}-[0-9]{4}.[0-9]{3}$/;
  if (docRegex.test(imgKey)) {
    // Document fact
    const docRanges = imgKey.match(docRegex)!;
    const docId = imgKey.split(docRanges[0])[0];
    let rangeStr = docRanges[0];
    if (rangeStr.startsWith("_")) {
      rangeStr = rangeStr.substring(1);
    }
    const ranges = rangeStr.split("_");
    const hRange = documentRangeFromString(ranges[0]);
    const vRange = documentRangeFromString(ranges[1]);
    if (!hRange || !vRange) {
      return "Document range not specified";
    }

    const documentFact = await FoundationFetcher.justOneDocument(docId);
    const png = documentFactImage(documentFact, hRange, vRange);
    return new Buffer(png.slice(png.indexOf(",") + 1), "base64"); // Remove "data:image/png;base64,"
  } else if (vidRegex.test(imgKey)) {
    // Video fact
    const vidRange = imgKey.match(vidRegex)!;
    const vidId = imgKey.split(vidRange[0])[0];
    const hRangeStr = vidRange[0];
    const hRange = videoRangeFromString(hRangeStr);
    if (hRange == null) {
      return "Video range not specified";
    }

    const videoFact = await FoundationFetcher.justOneVideo(vidId);
    const png = await videoFactImage(videoFact, hRange);
    return new Buffer(png.slice(png.indexOf(",") + 1), "base64"); // Remove "data:image/png;base64,"
  } else {
    return "Neither document nor video";
  }
}
