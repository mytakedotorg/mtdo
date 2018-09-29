import { Request, Response } from "express";
import { Foundation } from "../../../../../client/src/main/scripts/java2ts/Foundation";
import { decodeVideoFact } from "../common/DecodeVideoFact";
import { drawVideoFact } from "../common/DrawFacts";
const express = require("express");
const Canvas = require("canvas");
const router = express.Router();

function rangeFromString(rangeStr: string): [number, number] | null {
  if (rangeStr.startsWith("_")) {
    rangeStr = rangeStr.substring(1);
  }
  const rangeArr = rangeStr.split("-");
  if (rangeArr.length != 2) {
    return null;
  }
  const start = parseFloat(rangeArr[0]);
  const end = parseFloat(rangeArr[1]);
  if (isNaN(start) || isNaN(end)) {
    return null;
  }
  return [start, end];
}

function videoFactImage(
  videoFact: Foundation.VideoFactContentEncoded,
  hStart: number,
  hEnd: number
): Promise<string> {
  const canvas: HTMLCanvasElement = new Canvas(480, 360);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    return new Promise(function(resolve, reject) {
      drawVideoFact(canvas, decodeVideoFact(videoFact), [hStart, hEnd]).then(
        () => {
          canvas.toDataURL("image/jpeg", 0.5, (err: string, jpeg: string) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(jpeg);
            }
          });
        }
      );
    });
  } else {
    throw "Error getting canvas context";
  }
}

const IMAGEKEY = "imgkey";
router.get("/:" + IMAGEKEY, (req: Request, res: Response) => {
  // Expect imgKey for videos to be like "/vidId_hStart-hEnd.jpg
  // Expect imgKey for docs to be like "/docId_hStart-hEnd_vStart-vEnd.jpg
  const imgKeyAndExtension: string = req.params[IMAGEKEY];
  const imgKey = imgKeyAndExtension.substring(
    0,
    imgKeyAndExtension.lastIndexOf(".")
  );
  // Must test for documents first. Documents will also pass the video regex.
  const docRegex = /_[0-9]{4}.[0-9]{3}-[0-9]{4}.[0-9]{3}_[0-9]{4}.[0-9]{3}-[0-9]{4}.[0-9]{3}$/;
  const vidRegex = /_[0-9]{4}.[0-9]{3}-[0-9]{4}.[0-9]{3}$/;
  if (docRegex.test(imgKey)) {
    // Document fact
    const docRanges = imgKey.match(docRegex);
    if (docRanges !== null) {
      const docKeyArr = imgKey.split(docRanges[0])[0];
      const docId = docKeyArr[0];
      const docRangeArr = docKeyArr[1].split("_");
      const hRangeStr = docRangeArr[0];
      const vRangeStr = docRangeArr[1];
      const hRange = rangeFromString(hRangeStr);
      const vRange = rangeFromString(vRangeStr);
      if (hRange == null || vRange == null) {
        return res.status(404).send("Not found");
      }
      return res.send(
        "TODO: generate base64 image string for " +
          docId +
          " " +
          hRange +
          " " +
          vRange
      );
    } else {
      throw "Error in document fact regex";
    }
  } else if (vidRegex.test(imgKey)) {
    // Video fact
    const vidRange = imgKey.match(vidRegex);
    if (vidRange !== null) {
      const vidId = imgKey.split(vidRange[0])[0];
      const hRangeStr = vidRange[0];
      const hRange = rangeFromString(hRangeStr);
      if (hRange == null) {
        return res.status(404).send("Not found");
      }

      const videoFact: Foundation.VideoFactContentEncoded =
        req.app.locals.factHashMap[vidId];

      if (videoFact) {
        videoFactImage(videoFact, hRange[0], hRange[1])
          .then(function(jpeg: string) {
            const img = new Buffer(jpeg.split(",")[1], "base64"); // Remove "data:image/jpeg;base64,"
            res.writeHead(200, {
              "Content-Type": "image/jpeg",
              "Content-Length": img.length
            });
            return res.end(img);
          })
          .catch(function() {
            throw "Error creating image buffer";
          });
      } else {
        return res.status(404).send("Not found");
      }
    } else {
      throw "Error in video fact regex";
    }
  } else {
    return res.status(404).send("Not found");
  }
});

export default router;
