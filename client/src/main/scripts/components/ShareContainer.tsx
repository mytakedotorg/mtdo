import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument, DocumentBlock, VideoBlock } from "./BlockEditor";
import {
  alertErr,
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

interface Dimensions {
  x: number;
  y: number;
  totalHeight: number;
}

class ShareContainer extends React.Component<
  ShareContainerProps,
  ShareContainerState
> {
  private textMargin: number = 16;
  private width = 500;
  private linewidth = 468;
  private lineheight = 1.5; //multiplier
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
    // Draw fact title
    const titleSize = 20;
    let textSize = titleSize;
    ctx.font = "Bold " + textSize.toString() + "px Source Sans Pro";
    let x = this.textMargin;
    let y = textSize;
    ctx.fillText(title, x, y);

    for (const node of nodes) {
      if (node.component === "h2") {
        // Set the font style
        textSize = 22.5;
        ctx.font = "Bold " + textSize.toString() + "px Merriweather";

        // Add a margin above the new line of text
        y += textSize * this.lineheight;

        // Initialize an empty line of texxt
        let line = "";
        for (const text of node.innerHTML) {
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

        // Write the line of text at the coordinates
        ctx.fillText(line, this.textMargin, y);
      } else if (node.component === "p") {
        // Set font size
        textSize = 15;

        // Initialize the coorindates
        x = this.textMargin; // Left margin of text
        y += textSize * this.lineheight * this.lineheight; // Top margin

        // Loop through the innerHTML array to search for React Elements
        for (const text of node.innerHTML) {
          if (text) {
            let textStr = text.toString();
            let words = "";
            if (textStr === "[object Object]") {
              // Can't find a better conditional test
              // Found a React Element
              words += (text as ReactElement<HTMLSpanElement>).props.children;
              // This text is highlighted, so make it bold
              ctx.font = "Bold " + textSize.toString() + "px Merriweather";
            } else {
              words += textStr.trim();
              ctx.font = textSize.toString() + "px Merriweather";
            }

            const dimensions = this.drawText(ctx, words, textSize, x, y);
            // Set the dimensions of the next line to be drawn where the previous line left off
            y = dimensions.y;
            x = this.textMargin + dimensions.x;
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

    canvas.width = this.width * window.devicePixelRatio;
    canvas.style.width = this.width + "px";

    if (ctx) {
      // Draw the document once to calculate height
      const height = this.drawDocumentText(ctx, [...nodes], title);

      canvas.height = height * window.devicePixelRatio;
      canvas.style.height = height + "px";

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Draw grey background
      ctx.fillStyle = "#f2f4f7";
      ctx.fillRect(0, 0, this.width, height);

      // Set text color
      ctx.fillStyle = "#051a38";

      // Draw document again to draw the text
      this.drawDocumentText(ctx, [...nodes], title);

      return canvas.toDataURL("image/png");
    } else {
      const errStr = "Error getting canvas context";
      alertErr(errStr);
      throw errStr;
    }
  };
  drawCaption = (text: string): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = this.width * window.devicePixelRatio;
    canvas.style.width = this.width + "px";

    if (ctx) {
      // Set font styles
      const textSize = 15;
      ctx.font = "Bold " + textSize.toString() + "px Merriweather";

      // Draw text once to calculate height
      const height = this.drawText(ctx, text, textSize).totalHeight;

      canvas.height = height * window.devicePixelRatio;
      canvas.style.height = height + "px";

      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Draw grey background
      ctx.fillStyle = "#f2f4f7";
      ctx.fillRect(0, 0, this.width, height);
      ctx.fillStyle = "#051a38";

      // Not sure why, but font has been reset at this point, so must set it again
      ctx.font = "Bold " + textSize.toString() + "px Merriweather";
      this.drawText(ctx, text, textSize);

      return canvas.toDataURL("image/png");
    } else {
      const errStr = "Error getting canvas context";
      alertErr(errStr);
      throw errStr;
    }
  };
  drawText = (
    ctx: CanvasRenderingContext2D,
    words: string,
    fontsize: number,
    initialX?: number,
    initialY?: number
  ): Dimensions => {
    let wordsArr = words.split(" ");
    // Initialize variables
    let currentLineWidth = 0;
    let isFirstLine = true;
    let line = "";
    let x = initialX ? initialX : this.textMargin;
    let y = initialY ? initialY : fontsize;
    let totalHeight = fontsize;

    for (const word of wordsArr) {
      if (isFirstLine && initialX) {
        // Need to include width of previous line in this case
        currentLineWidth = ctx.measureText(line + word).width + initialX;
      } else {
        currentLineWidth = ctx.measureText(line + word).width;
      }

      if (currentLineWidth > this.linewidth) {
        // Start a new line
        if (isFirstLine) {
          if (!initialX) {
            y += fontsize / 2; //top margin of new paragraph
          }
          isFirstLine = false;
        } else {
          y += fontsize * this.lineheight;
        }
        ctx.fillText(line, x, y);
        totalHeight += fontsize * this.lineheight;
        x = this.textMargin;
        line = word + " ";
      } else {
        line += word + " ";
      }
    }

    // Draw the last line
    if (line.length > 0) {
      if (isFirstLine) {
        if (!initialX) {
          y += fontsize / 2; //top margin of new paragraph
        }
        isFirstLine = false;
      } else {
        y += fontsize * this.lineheight;
      }
      totalHeight += fontsize * this.lineheight;
      ctx.fillText(line, x, y);
      x = this.textMargin;
    }

    totalHeight += fontsize / 2; // add bottom margin

    return {
      x: ctx.measureText(line).width,
      y: y,
      totalHeight: totalHeight
    };
  };
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

                  const uri = this.drawCaption(highlightedText);

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
            "width:" + this.width + "px;" + "height:auto;" + "max-width:100%;";

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
