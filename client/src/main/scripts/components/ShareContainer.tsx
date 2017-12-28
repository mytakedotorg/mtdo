import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument, DocumentBlock, VideoBlock } from "./BlockEditor";
import {
  alertErr,
  getHighlightedNodes,
  FoundationNode
} from "../utils/functions";
import { fetchFact } from "../utils/databaseAPI";
import { Foundation } from "../java2ts/Foundation";
import { videoFact } from "../utils/testUtils";

interface ShareContainerProps {
  takeDocument: TakeDocument;
}

interface ShareContainerState {
  emailHTML: {
    __html: string;
  };
  documentFacts?: string[];
  videoFacts?: Foundation.VideoFactContent[];
}

interface StaticDocument {
  content: Foundation.DocumentFactContent;
  highlightedRange: [number, number];
  viewRange: [number, number];
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
      videoFacts: Foundation.VideoFactContent[]
    ) => any
  ) => {
    // Count documents and videos
    let factCount = 0;

    let factBlocks: Array<DocumentBlock | VideoBlock> = [];
    for (let block of this.props.takeDocument.blocks) {
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
    let videoFacts: Foundation.VideoFactContent[] = [];

    // Fetch facts and increment callback counter when complete
    for (let block of factBlocks) {
      switch (block.kind) {
        case "document":
          fetchFact(
            block.excerptId,
            (
              error: string | Error | null,
              factContent: Foundation.DocumentFactContent
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

                for (let documentComponent of factContent.components) {
                  nodes.push({
                    component: documentComponent.component,
                    innerHTML: [documentComponent.innerHTML],
                    offset: documentComponent.offset
                  });
                }

                let highlightedNodes = getHighlightedNodes(
                  [...nodes],
                  (block as DocumentBlock).highlightedRange,
                  (block as DocumentBlock).viewRange
                );

                const canvas = document.createElement("canvas");
                const width = 768;
                const height = 250;

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                  // Draw grey background
                  ctx.fillStyle = "#f2f4f7";
                  ctx.fillRect(0, 0, width, height);

                  // Set text color
                  ctx.fillStyle = "#051a38";

                  // Draw fact title
                  ctx.font = "Bold 24px Source Sans Pro";
                  ctx.fillText(factContent.fact.title, 0, 25);

                  // Draw highlighted nodes
                  ctx.font = "15px Merriweather";
                  let textHeight = 25;
                  for (let node of highlightedNodes) {
                    ctx.fillText(node.innerHTML.toString(), 0, textHeight);
                    textHeight += 25;
                  }

                  const url = canvas.toDataURL("image/png");
                  documentFacts.push(url);

                  if (factCallbacks === factCount) {
                    done(null, documentFacts, videoFacts);
                  }
                }
              }
            }
          );
          break;
        case "video":
          fetchFact(
            block.videoId,
            (
              error: string | Error | null,
              factContent: Foundation.VideoFactContent
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
                videoFacts.push(factContent);
                if (factCallbacks === factCount) {
                  done(null, documentFacts, videoFacts);
                }
              }
            }
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
        videoFacts: Foundation.VideoFactContent[]
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
          let htmlStr = "<h1>" + this.props.takeDocument.title + "</h1>";

          // Loop through blocks
          for (let block of this.props.takeDocument.blocks) {
            switch (block.kind) {
              case "paragraph":
                htmlStr += "<p>" + block.text + "</p>";
                break;
              case "document":
                try {
                  htmlStr +=
                    "<img src='" + documentFacts[documentFactCount] + "' />";
                  documentFactCount++;
                } catch (e) {
                  const errMsg =
                    "ShareContainer: number of documentFacts doesn't match number of document blocks";
                  alertErr(errMsg);
                  throw errMsg;
                }
                break;
              case "video":
                try {
                  videoFactCount++;
                  htmlStr += "<p>VIDEO FACT</p>";
                } catch (e) {
                  const errMsg =
                    "ShareContainer: number of videoFacts doesn't match number of video blocks";
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

          const emailHTML = {
            __html: htmlStr
          };

          this.setState({
            emailHTML: emailHTML,
            documentFacts: documentFacts
            // videoFacts: videoFacts
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
