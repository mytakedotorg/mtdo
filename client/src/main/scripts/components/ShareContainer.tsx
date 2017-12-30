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
import { ReactElement } from "react";

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
  drawDocumentText = (
    ctx: CanvasRenderingContext2D,
    nodes: FoundationNode[],
    title: string
  ): number => {
    const titleSize = 20;
    let textSize = titleSize;
    let y = textSize;
    const linewidth = 60; //number of characters in a line
    const lineheight = 1.5; //multiplier

    // Draw fact title
    textSize = titleSize;
    ctx.font = "Bold " + textSize.toString() + "px Source Sans Pro";
    let x = 16;
    y = textSize;
    ctx.fillText(title, x, y);

    for (let node of nodes) {
      if (node.component === "h2") {
        textSize = 22.5;
        ctx.font = "Bold " + textSize.toString() + "px Merriweather";
        y += textSize * lineheight;
        let line = "";
        for (let text of node.innerHTML) {
          // Loop through the innerHTML array to search for React Elements
          if (text) {
            let textStr = text.toString();
            if (textStr === "[object Object]") {
              // Can't find a better conditional test
              // Found a React Element
              line += (text as ReactElement<HTMLSpanElement>).props.children;
            } else {
              line += textStr;
            }
          }
        }
        ctx.fillText(line, x, y);
      } else if (node.component === "p") {
        textSize = 15;

        // Loop through the innerHTML array to search for React Elements
        for (let text of node.innerHTML) {
          if (text) {
            let textStr = text.toString();
            let words = "";
            if (textStr === "[object Object]") {
              // Can't find a better conditional test
              // Found a React Element
              words += (text as ReactElement<HTMLSpanElement>).props.children;
              ctx.font = "Bold " + textSize.toString() + "px Merriweather";
            } else {
              words += textStr.trim();
              ctx.font = textSize.toString() + "px Merriweather";
            }
            let wordsArr = words.split(" ");
            let charCount = 0;
            let line = "";
            let isFirstLine = true;

            for (let word of wordsArr) {
              charCount += word.length + 1; //count the space
              if (charCount > 60) {
                // Start a new line
                y += textSize * lineheight;
                if (isFirstLine) {
                  y += textSize; //top margin of new paragraph
                  isFirstLine = false;
                }
                ctx.fillText(line, x, y);
                line = word + " ";
                charCount = word.length + 1;
              } else {
                line += word + " ";
              }
            }

            if (line.length > 0) {
              y += textSize * lineheight;
              if (isFirstLine) {
                y += textSize; //top margin of new paragraph
                isFirstLine = false;
              }
              ctx.fillText(line, x, y);
              line = "";
              charCount = 0;
            }
          }
        }
        y += textSize / 2; //bottom margin
      } else {
        const errStr = "Unknown component";
        alertErr(errStr);
        throw errStr;
      }
    }
    return y;
  };
  drawDocument = (nodes: FoundationNode[], title: string): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 768;

    canvas.width = width * window.devicePixelRatio;
    canvas.style.width = width + "px";

    if (ctx) {
      // Loop through once to calculate height
      const height = this.drawDocumentText(ctx, [...nodes], title);

      canvas.height = height * window.devicePixelRatio;
      canvas.style.height = height + "px";

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      // Draw grey background
      ctx.fillStyle = "#f2f4f7";
      ctx.fillRect(0, 0, width, height);

      // Set text color
      ctx.fillStyle = "#051a38";

      // Loop again to draw the text
      this.drawDocumentText(ctx, [...nodes], title);

      const url = canvas.toDataURL("image/png");
      return url;
    } else {
      const errStr = "Error getting canvas context";
      alertErr(errStr);
      throw errStr;
    }
  };
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
    for (let idx = 0; idx < factBlocks.length; idx++) {
      const block = factBlocks[idx];
      switch (block.kind) {
        case "document":
          fetchFact(
            block.excerptId,
            (
              error: string | Error | null,
              factContent: Foundation.DocumentFactContent,
              index: number
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

                const url = this.drawDocument(
                  [...highlightedNodes],
                  factContent.fact.title
                );

                documentFacts[index] = url;

                if (factCallbacks === factCount) {
                  done(null, documentFacts, videoFacts);
                }
              }
            },
            // Pass in the block index to guarantee order even if
            // the fetches don't return in the order in which they
            // were called.
            idx
          );
          break;
        case "video":
          fetchFact(
            block.videoId,
            (
              error: string | Error | null,
              factContent: Foundation.VideoFactContent,
              index: number
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
            },
            idx
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
          console.log(documentFacts);
          for (let block of this.props.takeDocument.blocks) {
            switch (block.kind) {
              case "paragraph":
                htmlStr += "<p>" + block.text + "</p>";
                break;
              case "document":
                try {
                  htmlStr +=
                    "<img style='width:768px;height:auto;' src='" +
                    documentFacts[documentFactCount] +
                    "' />";
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
