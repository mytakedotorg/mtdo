/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { ImageProps } from "../java2ts/ImageProps";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { decodeVideoFact } from "../common/DecodeVideoFact";
import { drawVideoFact, drawDocument, drawSpecs } from "../common/DrawFacts";
import { FoundationNode } from "../common/CaptionNodes";
import { alertErr, getHighlightedNodes, slugify } from "../utils/functions";
import {
  TakeDocument,
  DocumentBlock,
  VideoBlock,
} from "../components/BlockEditor";

function fetchFact(
  factHash: string,
  callback: (
    error: string | Error | null,
    documentFact:
      | Foundation.DocumentFactContent
      | Foundation.VideoFactContent
      | null,
    index?: number | null,
    block?: DocumentBlock | VideoBlock | null
  ) => any,
  index?: number,
  block?: DocumentBlock | VideoBlock
): void {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests

  const request: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "default",
  };

  fetch(Routes.FOUNDATION_DATA + "/" + factHash + ".json", request)
    .then(function (response: Response) {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      } else {
        callback("Error retrieving Fact", null);
      }
    })
    .then(function (json: any) {
      if (json.fact.kind === "video") {
        callback(null, decodeVideoFact(json), index, block);
      } else if (index !== undefined) {
        if (block !== undefined) {
          callback(null, json, index, block);
        } else {
          callback(null, json, index);
        }
      } else {
        callback(null, json);
      }
    })
    .catch(function (error: TypeError) {
      callback(error, null);
    });
}

export type FactHashMap = [
  string,
  Foundation.VideoFactContent | Foundation.DocumentFactContent
];

export function fetchFactReturningPromise(
  factHash: string
): Promise<FactHashMap> {
  const headers = new Headers();

  headers.append("Accept", "application/json");

  const request: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "default",
  };

  return fetch(Routes.FOUNDATION_DATA + "/" + factHash + ".json", request)
    .then(function (response: Response) {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      }
      throw "Expected an OK JSON response";
    })
    .then(function (
      json: Foundation.VideoFactContentEncoded | Foundation.DocumentFactContent
    ) {
      return [factHash, isVideo(json) ? decodeVideoFact(json) : json];
    });
}

function isDocument(
  fact?: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.DocumentFactContent {
  if (fact) {
    return (fact as Foundation.DocumentFactContent).fact.kind === "document";
  } else {
    return false;
  }
}

export type VideoContent =
  | Foundation.VideoFactContent
  | Foundation.VideoFactContentEncoded;
function isVideo(fact?: Foundation.FactContent | null): fact is VideoContent {
  if (fact) {
    return (fact as VideoContent).fact.kind === "video";
  } else {
    return false;
  }
}

interface DocumentImageURI {
  imageProps: ImageProps;
  url: string;
  title: string;
  alt: string;
  cid: string;
}

interface VideoImageURIs {
  youtubeUri: string;
  imageProps: ImageProps | null;
  url: string;
  title: string;
  alt: string;
  cid: string;
}

function drawFacts(
  takeDocument: TakeDocument,
  callback: (
    error: string | Error | null,
    documentFacts: DocumentImageURI[],
    videoFacts: VideoImageURIs[]
  ) => void
): void {
  // Count documents and videos
  let factCount = 0;

  let factBlocks: Array<DocumentBlock | VideoBlock> = [];
  for (const block of takeDocument.blocks) {
    // We only care about document/video blocks for this
    switch (block.kind) {
      case "document":
        factCount++;
        factBlocks.push(block);
        break;
      case "video":
        factCount++;
        factBlocks.push(block);
        break;
    }
  }

  if (factCount > 0) {
    // Initialize callback counter
    let factCallbacks = 0;

    // Initialize fact counters
    let documentFactCount = 0;
    let videoFactCount = 0;

    let documentFacts: DocumentImageURI[] = [];
    let videoFacts: VideoImageURIs[] = [];

    // Fetch facts and increment callback counter when complete
    for (let idx = 0; idx < factBlocks.length; idx++) {
      const block = factBlocks[idx];
      switch (block.kind) {
        case "document":
          fetchFact(
            block.excerptId,
            (
              error: string | Error | null,
              factContent: Foundation.DocumentFactContent,
              index: number,
              blockInScope: DocumentBlock
            ) => {
              if (error) {
                if (typeof error != "string") {
                  alertErr("databaseAPI: " + error.message);
                } else {
                  alertErr("databaseAPI: " + error);
                }
                throw error;
              } else {
                factCallbacks++;

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
                  blockInScope.highlightedRange,
                  blockInScope.viewRange
                );

                const title = factContent.fact.title;
                const titleSlug = slugify(title);

                const canvas = document.createElement("canvas");
                const imageProps = drawDocument(
                  canvas,
                  [...highlightedNodes],
                  title
                );

                const documentURL =
                  Routes.FOUNDATION_V1 +
                  "/" +
                  titleSlug +
                  "/" +
                  blockInScope.highlightedRange[0] +
                  "-" +
                  blockInScope.highlightedRange[1] +
                  "/" +
                  blockInScope.viewRange[0] +
                  "-" +
                  blockInScope.viewRange[1] +
                  "/";

                documentFacts[documentFactCount] = {
                  imageProps: imageProps,
                  url: documentURL,
                  title: title,
                  alt: title,
                  cid: "doc" + documentFactCount.toString(),
                };
                documentFactCount++;

                if (factCallbacks === factCount) {
                  callback(null, documentFacts, videoFacts);
                }
              }
            },
            // Pass in the block and index to guarantee order even if
            // the fetches don't return in the order in which they
            // were called.
            idx,
            block
          );
          break;
        case "video":
          fetchFact(
            block.videoId,
            async (
              error: string | Error | null,
              factContent: Foundation.VideoFactContent,
              index: number,
              blockInScope: VideoBlock
            ) => {
              if (error) {
                if (typeof error != "string") {
                  alertErr("databaseAPI: " + error.message);
                } else {
                  alertErr("databaseAPI: " + error);
                }
                throw error;
              } else {
                factCallbacks++;

                const title = factContent.fact.title;
                const titleSlug = slugify(title);

                if (factContent && blockInScope.range) {
                  const canvas = document.createElement("canvas");
                  const imageProps = await drawVideoFact(
                    canvas,
                    factContent,
                    blockInScope.range
                  );

                  const videoURL =
                    Routes.FOUNDATION_V1 +
                    "/" +
                    titleSlug +
                    "/" +
                    blockInScope.range[0].toFixed(3) +
                    "-" +
                    blockInScope.range[1].toFixed(3);

                  videoFacts[videoFactCount] = {
                    youtubeUri: factContent.youtubeId,
                    imageProps: imageProps,
                    url: videoURL,
                    title: title,
                    alt: title,
                    cid: "vid" + videoFactCount.toString(),
                  };
                  videoFactCount++;
                } else {
                  const videoURL =
                    Routes.FOUNDATION_V1 +
                    "/" +
                    slugify(factContent.fact.title);

                  videoFacts[videoFactCount] = {
                    youtubeUri: factContent.youtubeId,
                    imageProps: null,
                    url: videoURL,
                    title: title,
                    alt: title,
                    cid: "vid" + videoFactCount.toString(),
                  };
                  videoFactCount++;
                }

                if (factCallbacks === factCount) {
                  callback(null, documentFacts, videoFacts);
                }
              }
            },
            // Pass in the block and index to guarantee order even if
            // the fetches don't return in the order in which they
            // were called.
            idx,
            block
          );
          break;
      }
    }
  } else {
    callback(null, [], []);
  }
}

export { fetchFact, isDocument, isVideo };
