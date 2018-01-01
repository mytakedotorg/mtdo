import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument, DocumentBlock, VideoBlock } from "./BlockEditor";
import {
  alertErr,
  drawCaption,
  drawDocument,
  drawDocumentText,
  drawSpecs,
  drawText,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  getHighlightedNodes,
  highlightText,
  FoundationNode
} from "../utils/functions";
import { fetchFact } from "../utils/databaseAPI";
import { Foundation } from "../java2ts/Foundation";
import { ReactElement } from "react";

interface ShareContainerProps {
  takeDocument: TakeDocument;
}

interface ShareContainerState {
  emailHTML: {
    __html: string;
  };
}

interface VideoImageURIs {
  youtube: string;
  captions: string | null;
}

class ShareContainer extends React.Component<
  ShareContainerProps,
  ShareContainerState
> {
  constructor(props: ShareContainerProps) {
    super(props);

    this.state = {
      emailHTML: {
        __html: ""
      }
    };
  }
  getFacts = (
    done: (
      error: string | Error | null,
      documentFacts: string[],
      videoFacts: VideoImageURIs[]
    ) => any
  ) => {
    // Count documents and videos
    let factCount = 0;

    let factBlocks: Array<DocumentBlock | VideoBlock> = [];
    for (const block of this.props.takeDocument.blocks) {
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

    // Initialize callback counter
    let factCallbacks = 0;

    let documentFacts: string[] = [];
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
                  alertErr("ShareContainer: " + error.message);
                } else {
                  alertErr("ShareContainer: " + error);
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

                const url = drawDocument(
                  [...highlightedNodes],
                  factContent.fact.title
                );

                documentFacts[index] = url;

                if (factCallbacks === factCount) {
                  done(null, documentFacts, videoFacts);
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
                  alertErr("ShareContainer: " + error.message);
                } else {
                  alertErr("ShareContainer: " + error);
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

                  const uri = drawCaption(highlightedText);

                  videoFacts[index] = {
                    youtube: factContent.youtubeId,
                    captions: uri
                  };
                } else {
                  videoFacts[index] = {
                    youtube: factContent.youtubeId,
                    captions: null
                  };
                }

                if (factCallbacks === factCount) {
                  done(null, documentFacts, videoFacts);
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
  };
  handleEmailSharePress = () => {
    this.getFacts(
      (
        error: string | Error | null,
        documentFacts: string[],
        videoFacts: VideoImageURIs[]
      ) => {
        if (error) {
          if (typeof error != "string") {
            alertErr("ShareContainer: " + error.message);
          } else {
            alertErr("ShareContainer: " + error);
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
            this.props.takeDocument.title +
            "</h1>" +
            "</td>" +
            "</tr>" +
            "</table>" +
            "</td>" +
            "</tr>";

          const imageStyles =
            "width:" +
            drawSpecs.width +
            "px;" +
            "height:auto;" +
            "max-width:100%;";

          // Loop through blocks
          for (const block of this.props.takeDocument.blocks) {
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
                  htmlStr +=
                    "<tr>" +
                    "<td align='center'>" +
                    '<img style="' +
                    imageStyles +
                    '" src="' +
                    documentFacts[documentFactCount] +
                    '" />' +
                    "</td>" +
                    "</tr>";
                  documentFactCount++;
                } catch (e) {
                  const errMsg =
                    "ShareContainer: array index out of bounds - number of documentFacts doesn't match number of document blocks";
                  alertErr(errMsg);
                  throw errMsg;
                }
                break;
              case "video":
                try {
                  htmlStr +=
                    "<tr>" +
                    "<td align='center'>" +
                    '<img style="' +
                    imageStyles +
                    '" src="' +
                    "https://img.youtube.com/vi/" +
                    videoFacts[videoFactCount].youtube +
                    '/0.jpg" />' +
                    "</td>" +
                    "</tr>";

                  htmlStr +=
                    "<tr>" +
                    "<td align='center'>" +
                    '<img style="' +
                    imageStyles +
                    '" src="' +
                    videoFacts[videoFactCount].captions +
                    '" />' +
                    "</td>" +
                    "</tr>";
                  videoFactCount++;
                } catch (e) {
                  const errMsg =
                    "ShareContainer: array index out of bounds - number of videoFacts doesn't match number of video blocks";
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

          const emailHTML = {
            __html: htmlStr
          };

          this.setState({
            emailHTML: emailHTML
          });
        }
      }
    );
  };
  render() {
    return (
      <div className="share__container">
        <div className="share__inner-container">
          <h1>Share</h1>
          <button
            className="share__button share__button--email"
            onClick={this.handleEmailSharePress}
          >
            Email
          </button>
          <div
            className="share__modal"
            dangerouslySetInnerHTML={this.state.emailHTML}
          />
        </div>
      </div>
    );
  }
}

export default ShareContainer;
