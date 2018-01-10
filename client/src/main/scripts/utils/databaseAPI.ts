import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { DraftRev } from "../java2ts/DraftRev";
import { DraftPost } from "../java2ts/DraftPost";
import { PublishResult } from "../java2ts/PublishResult";
import { TakeReactionJson } from "../java2ts/TakeReactionJson";
import { EmailSelf } from "../java2ts/EmailSelf";
import {
  alertErr,
  FoundationNode,
  getHighlightedNodes,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  highlightText,
  ImageProps,
  drawDocument,
  drawCaption,
  drawSpecs,
  slugify
} from "../utils/functions";
import {
  TakeDocument,
  DocumentBlock,
  VideoBlock
} from "../components/BlockEditor";
import { ReactElement } from "react";

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

  fetch(Routes.FOUNDATION_DATA_INDEX, request)
    .then(function(response: Response) {
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
    .then(function(json: any) {
      callback(null, json);
    })
    .catch(function(error: TypeError) {
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
      if (index !== undefined) {
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
  bodyJson:
    | DraftPost
    | DraftRev
    | TakeReactionJson.ReactReq
    | TakeReactionJson.ViewReq
    | EmailSelf,
  successCb: (
    json?:
      | DraftRev
      | PublishResult
      | TakeReactionJson.ReactRes
      | TakeReactionJson.ViewRes
  ) => void
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
    .then((json: DraftRev) => {
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
}

interface VideoImageURIs {
  youtubeUri: string;
  imageProps: ImageProps | null;
  url: string;
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

                const imageProps = drawDocument(
                  [...highlightedNodes],
                  factContent.fact.title
                );
                imageProps.title = factContent.fact.title;
                imageProps.alt = factContent.fact.title;

                const documentURL =
                  Routes.FOUNDATION +
                  "/" +
                  slugify(factContent.fact.title) +
                  "/" +
                  blockInScope.highlightedRange[0] +
                  "-" +
                  blockInScope.highlightedRange[1] +
                  "/" +
                  blockInScope.viewRange[0] +
                  "-" +
                  blockInScope.viewRange[1] +
                  "/";

                documentFacts[index] = {
                  imageProps: imageProps,
                  url: documentURL
                };

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

                if (
                  factContent.transcript &&
                  factContent.speakerMap &&
                  blockInScope.range
                ) {
                  const captionNodes = getCaptionNodeArray(
                    factContent.transcript,
                    factContent.speakerMap
                  );

                  const characterRange = getCharRangeFromVideoRange(
                    factContent.transcript,
                    factContent.speakerMap,
                    blockInScope.range
                  );

                  const highlightedCaptionNodes = highlightText(
                    captionNodes,
                    characterRange,
                    () => {}
                  );

                  let highlightedText = '"';
                  for (const node of highlightedCaptionNodes) {
                    for (const text of node.innerHTML) {
                      if (text) {
                        let textStr = text.toString();
                        if (textStr === "[object Object]") {
                          // Can't find a better conditional test
                          // Found a React Element, which is highlighted text
                          highlightedText += (text as ReactElement<
                            HTMLSpanElement
                          >).props.children;
                        }
                      }
                    }
                  }
                  highlightedText = highlightedText.trimRight();
                  highlightedText += '"';

                  const imageProps = drawCaption(highlightedText);
                  imageProps.title = factContent.fact.title;
                  imageProps.alt = factContent.fact.title;

                  const videoURL =
                    Routes.FOUNDATION +
                    "/" +
                    slugify(factContent.fact.title) +
                    "/" +
                    blockInScope.range[0] +
                    "-" +
                    blockInScope.range[1];

                  videoFacts[index] = {
                    youtubeUri: factContent.youtubeId,
                    imageProps: imageProps,
                    url: videoURL
                  };
                } else {
                  const videoURL =
                    Routes.FOUNDATION + "/" + slugify(factContent.fact.title);

                  videoFacts[index] = {
                    youtubeUri: factContent.youtubeId,
                    imageProps: null,
                    url: videoURL
                  };
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

function sendEmail(takeDocument: TakeDocument, done: () => void): void {
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
                htmlStr +=
                  "<tr>" +
                  "<td align='center'>" +
                  '<a href="' +
                  "https://mytake.org/" +
                  documentImageURI.url +
                  '">' +
                  '<img style="' +
                  imageStyles +
                  '" src="' +
                  documentImageURI.imageProps.src +
                  '" width="' +
                  documentImageURI.imageProps.width +
                  '" height="' +
                  documentImageURI.imageProps.height +
                  '" alt="' +
                  documentImageURI.imageProps.alt +
                  '" title="' +
                  documentImageURI.imageProps.title +
                  '" />' +
                  "</a>" +
                  "</td>" +
                  "</tr>";
                documentFactCount++;
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

                htmlStr +=
                  "<tr>" +
                  "<td align='center'>" +
                  '<a href="' +
                  "https://mytake.org/" +
                  videoImageURI.url +
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
                    "https://mytake.org/" +
                    videoImageURI.url +
                    '">' +
                    '<img style="' +
                    imageStyles +
                    '" src="' +
                    videoImageURI.imageProps.src +
                    '" width="' +
                    videoImageURI.imageProps.width +
                    '" height="' +
                    videoImageURI.imageProps.height +
                    '" alt="' +
                    videoImageURI.imageProps.alt +
                    '" title="' +
                    videoImageURI.imageProps.title +
                    '" />' +
                    "</a>" +
                    "</td>" +
                    "</tr>";
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
          body: htmlStr
        };

        postRequest(Routes.API_EMAIL_SELF, body, function() {
          done();
        });
      }
    }
  );
}
export { getAllFacts, fetchFact, isDocument, isVideo, postRequest, sendEmail };
