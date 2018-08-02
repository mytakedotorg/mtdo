import { Request, Response } from "express";
import { Foundation } from "../../../../../client/src/main/scripts/java2ts/Foundation";
const express = require("express");
const Canvas = require("canvas");
const router = express.Router();

function rangeFromString(rangeStr: string): [number, number] | null {
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
  videoFact: Foundation.VideoFactContent
): Promise<string> {
  const canvas: HTMLCanvasElement = new Canvas(200, 200);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Draw a square"
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, 200, 200);

    /**
     *  TODO: Call drawVideoFact from client code
     * */
    // drawVideoFact(canvas, videoFact, [15, 20]);

    return new Promise(function(resolve, reject) {
      canvas.toDataURL("image/jpeg", 0.5, (err: string, jpeg: string) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(jpeg);
        }
      });
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
  const imgArr = imgKey.split("_");
  if (imgArr.length == 2) {
    // Video fact
    const vidId = imgArr[0];
    const hRangeStr = imgArr[1];
    const hRange = rangeFromString(hRangeStr);
    if (hRange == null) {
      return res.status(404).send("Not found");
    }

    const videoFact: Foundation.VideoFactContent =
      req.app.locals.factHashMap[vidId];

    videoFactImage(videoFact)
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
  } else if (imgArr.length == 3) {
    // Document fact
    const docId = imgArr[0];
    const hRangeStr = imgArr[1];
    const vRangeStr = imgArr[2];
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
    return res.status(404).send("Not found");
  }
});

export default router;
