import { ImageProps } from "../java2ts/ImageProps";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { EmailSelf } from "../java2ts/EmailSelf";
import { decodeVideoFact } from "./DecodeVideoFact";
import { drawVideoFact, drawDocument, drawSpecs } from "./DrawFacts";
import { FoundationNode } from "../utils/CaptionNodes";
import { alertErr, getHighlightedNodes, slugify } from "../utils/functions";
import {
  TakeDocument,
  DocumentBlock,
  VideoBlock
} from "../components/BlockEditor";

function getAllFacts(
  callback: (
    error: string | Error | null,
    factLinks: Foundation.FactLink[]
  ) => any
): void {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests

  const request: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "default"
  };

  fetch(Routes.FOUNDATION_INDEX_HASH, request)
    .then((response: Response) => {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      } else {
        callback("Error retrieving Facts", []);
      }
    })
    .then((json: Foundation.IndexPointer) => {
      return fetch(Routes.FOUNDATION_DATA + "/" + json.hash + ".json", request);
    })
    .then((response: Response) => {
      return response.json();
    })
    .then((json: Foundation.FactLink[]) => {
      callback(null, json);
    })
    .catch((error: TypeError) => {
      callback(error, []);
    });
}

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
    cache: "default"
  };

  fetch(Routes.FOUNDATION_DATA + "/" + factHash + ".json", request)
    .then(function(response: Response) {
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
    .then(function(json: any) {
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
    .catch(function(error: TypeError) {
      callback(error, null);
    });
}

export interface VideoFactHashMap {
  hash: string;
  videoFact: Foundation.VideoFactContent;
}

export function fetchFactReturningPromise(
  factHash: string
): Promise<VideoFactHashMap> {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests

  const request: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "default"
  };

  return fetch(Routes.FOUNDATION_DATA + "/" + factHash + ".json", request)
    .then(function(response: Response) {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      }
    })
    .then(function(json: Foundation.VideoFactContentEncoded) {
      return {
        hash: factHash,
        videoFact: decodeVideoFact(json)
      };
    });
}

function isDocument(
  fact: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.DocumentFactContent {
  if (fact) {
    return (fact as Foundation.DocumentFactContent).fact.kind === "document";
  } else {
    return false;
  }
}

function isVideo(
  fact: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.VideoFactContent {
  if (fact) {
    return (fact as Foundation.VideoFactContent).fact.kind === "video";
  } else {
    return false;
  }
}

function postRequest(
  route: string,
  bodyJson: any,
  successCb: (json?: any) => void
) {
  const headers = new Headers();

  headers.append("Accept", "application/json"); // This one is enough for GET requests
  headers.append("Content-Type", "application/json"); // This one sends body

  const request: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: headers,
    body: JSON.stringify(bodyJson)
  };
  fetch(route, request)
    .then(function(response: Response) {
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.indexOf("application/json") >= 0 &&
        response.ok
      ) {
        return response.json();
      } else if (route === Routes.DRAFTS_DELETE && response.ok) {
        window.location.href = Routes.DRAFTS;
      } else if (route === Routes.API_EMAIL_SELF && response.ok) {
        successCb();
      } else {
        alertErr(
          "databaseAPI + " + route + ": Unexpected response from server."
        );
        throw "Unexpected response from server.";
      }
    })
    .then((json: any) => {
      successCb(json);
    })
    .catch(function(error: Error) {
      alertErr("databaseAPI + " + route + ": " + error.message);
      throw error;
    });
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
                    offset: documentComponent.offset
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
                  cid: "doc" + documentFactCount.toString()
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
            (
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
                  const imageProps = drawVideoFact(
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
                    cid: "vid" + videoFactCount.toString()
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
                    cid: "vid" + videoFactCount.toString()
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

interface cidMap {
  [key: string]: string;
}

function sendEmail(
  takeDocument: TakeDocument,
  url: string | null,
  done: () => void
): void {
  drawFacts(
    takeDocument,
    (
      error: string | Error | null,
      documentFacts: DocumentImageURI[],
      videoFacts: VideoImageURIs[]
    ) => {
      if (error) {
        if (typeof error != "string") {
          alertErr("databaseAPI - sendEmail: " + error.message);
        } else {
          alertErr("databaseAPI - sendEmail: " + error);
        }
        throw error;
      } else {
        // Now we have all of the facts

        // Initialize counters
        let documentFactCount = 0;
        let videoFactCount = 0;

        // Intialize map of cids to URLs
        let cidUriMap: cidMap = {};

        // Initialize HTML string
        let htmlStr =
          '<table width="100%" border="0" cellspacing="0" cellpadding="0">';

        // Add the title
        htmlStr +=
          "<tr>" +
          "<td align='center'>" +
          '<table width="768" border="0" cellspacing="0" cellpadding="0">' +
          "<tr>" +
          "<td>" +
          "<h1 style=\"font-family: 'Source Sans Pro', sans-serif;" +
          "font-weight: 700;" +
          "font-size: 44px;" +
          "line-height: 1.3em;" +
          "margin-bottom: 19.2px;" +
          "margin-left: 16px;" +
          "margin-right: 16px;" +
          '">' +
          takeDocument.title +
          "</h1>" +
          "</td>" +
          "</tr>" +
          "</table>" +
          "</td>" +
          "</tr>";

        const imageStyles =
          "display:block;" +
          "width:" +
          drawSpecs.width +
          "px;" +
          "height:auto;" +
          "max-width:100%;";

        // Loop through blocks
        for (const block of takeDocument.blocks) {
          switch (block.kind) {
            case "paragraph":
              htmlStr +=
                "<tr>" +
                "<td align='center'>" +
                '<table width="768" border="0" cellspacing="0" cellpadding="0">' +
                "<tr>" +
                "<td>" +
                "<p style=\"font-family: 'Source Sans Pro', sans-serif;" +
                "margin-bottom: 19.2px;" +
                "margin-left: 16px;" +
                "margin-right: 16px;" +
                "font-weight: 400;" +
                "font-size: 16px;" +
                "line-height: 1.7em;" +
                '">' +
                block.text +
                "</p>" +
                "</td>" +
                "</tr>" +
                "</table>" +
                "</td>" +
                "</tr>";
              break;
            case "document":
              try {
                const documentImageURI = documentFacts[documentFactCount];
                const linkUrl = url ? url : documentImageURI.url;
                htmlStr +=
                  "<tr>" +
                  "<td align='center'>" +
                  '<a href="' +
                  "https://mytake.org" +
                  linkUrl +
                  '">' +
                  '<img src="cid:' +
                  documentImageURI.cid +
                  '" width="' +
                  documentImageURI.imageProps.width +
                  '" height="' +
                  documentImageURI.imageProps.height +
                  '" alt="' +
                  documentImageURI.alt +
                  '" title="' +
                  documentImageURI.title +
                  '" style="' +
                  imageStyles +
                  '" />' +
                  "</a>" +
                  "</td>" +
                  "</tr>";
                documentFactCount++;
                cidUriMap[documentImageURI.cid] =
                  documentImageURI.imageProps.dataUri;
              } catch (e) {
                const errMsg =
                  "databaseAPI: array index out of bounds - number of documentFacts doesn't match number of document blocks";
                alertErr(errMsg);
                throw errMsg;
              }
              break;
            case "video":
              try {
                const videoImageURI = videoFacts[videoFactCount];
                const linkUrl = url ? url : videoImageURI.url;

                htmlStr +=
                  "<tr>" +
                  "<td align='center'>" +
                  '<a href="' +
                  "https://mytake.org" +
                  linkUrl +
                  '">' +
                  '<img style="' +
                  imageStyles +
                  '" src="' +
                  "https://img.youtube.com/vi/" +
                  videoImageURI.youtubeUri +
                  '/0.jpg" />' +
                  "</a>" +
                  "</td>" +
                  "</tr>";

                if (videoImageURI.imageProps) {
                  htmlStr +=
                    "<tr>" +
                    "<td align='center'>" +
                    '<a href="' +
                    "https://mytake.org" +
                    linkUrl +
                    '">' +
                    '<img src="cid:' +
                    videoImageURI.cid +
                    '" width="' +
                    videoImageURI.imageProps.width +
                    '" height="' +
                    videoImageURI.imageProps.height +
                    '" alt="' +
                    videoImageURI.alt +
                    '" title="' +
                    videoImageURI.title +
                    '" style="' +
                    imageStyles +
                    '" />' +
                    "</a>" +
                    "</td>" +
                    "</tr>";
                  cidUriMap[videoImageURI.cid] =
                    videoImageURI.imageProps.dataUri;
                }
                videoFactCount++;
              } catch (e) {
                const errMsg =
                  "databaseAPI: array index out of bounds - number of videoFacts doesn't match number of video blocks";
                alertErr(errMsg);
                throw errMsg;
              }
              break;
            default:
              const errStr = "Unknown block in Take document object";
              alertErr(errStr);
              throw errStr;
          }
        }

        htmlStr += "</table>";

        const body: EmailSelf = {
          subject: takeDocument.title,
          body: htmlStr,
          cidMap: cidUriMap
        };

        postRequest(Routes.API_EMAIL_SELF, body, function() {
          done();
        });
      }
    }
  );
}
export { getAllFacts, fetchFact, isDocument, isVideo, postRequest, sendEmail };
