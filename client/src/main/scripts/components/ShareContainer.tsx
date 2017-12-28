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
  documentFacts?: StaticDocument[];
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
      documentFacts: StaticDocument[],
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

    let documentFacts: StaticDocument[] = [];
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
                documentFacts.push({
                  content: factContent,
                  highlightedRange: (block as DocumentBlock).highlightedRange,
                  viewRange: (block as DocumentBlock).viewRange
                });
                if (factCallbacks === factCount) {
                  done(null, documentFacts, videoFacts);
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
        documentFacts: StaticDocument[],
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
                    "<canvas id='document" +
                    documentFactCount.toString() +
                    "' width='768' height='250'></canvas>";
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
  drawCanvases = () => {
    if (this.state.documentFacts) {
      for (let i = 0; i < this.state.documentFacts.length; i++) {
        let canvas = document.getElementById("document" + i.toString());
        if (canvas) {
          let ctx = (canvas as HTMLCanvasElement).getContext("2d");
          const currentFact = this.state.documentFacts[i];
          let nodes: FoundationNode[] = [];

          for (let documentComponent of currentFact.content.components) {
            nodes.push({
              component: documentComponent.component,
              innerHTML: [documentComponent.innerHTML],
              offset: documentComponent.offset
            });
          }

          let highlightedNodes = getHighlightedNodes(
            [...nodes],
            currentFact.highlightedRange,
            currentFact.viewRange
          );

          let data =
            '<svg xmlns="http://www.w3.org/2000/svg" width="768" height="250">' +
            '<foreignObject width="100%" height="100%">' +
            '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
            "<div style=\"background-color: rgb(242, 244, 247);color: #051a38;border-radius: 3px;font-family: 'Merriweather', serif;font-weight: 400;font-size: 15px;line-height: 1.7em;margin-bottom: 19.2px;padding-left: 16px;padding-right: 16px;\" >" +
            "<h2 style=\"font-family: 'Source Sans Pro', sans-serif;font-weight: 700;font-size: 24px;line-height: 1.3em;\" >" +
            currentFact.content.fact.title +
            "</h2>";

          data += "</div></div></foreignObject></svg>";

          let DOMURL = window.URL || (window as any).webkitURL || window;

          let img = new Image();
          img.crossOrigin = "anonymous";
          let svg = new Blob([data], { type: "image/svg+xml" });
          let url = DOMURL.createObjectURL(svg);
          img.onload = () => {
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              DOMURL.revokeObjectURL(url);
              try {
                let pngSrc = (canvas as HTMLCanvasElement).toDataURL(
                  "image/png"
                );
                console.log(pngSrc);
              } catch (e) {
                // toDataURL throws an error on localhost, but should work in production
                console.warn(e);
              }
            } else {
              const errMsg =
                "ShareContainer: error getting canvas context " + i.toString();
              alertErr(errMsg);
              throw errMsg;
            }
          };
          img.src = url;
        } else {
          const errMsg =
            "ShareContainer: error getting canvas element " + i.toString();
          alertErr(errMsg);
          throw errMsg;
        }
      }
    }
  };
  componentDidUpdate(
    prevProps: ShareContainerProps,
    prevState: ShareContainerState
  ) {
    const emailHTML = this.state.emailHTML.__html;
    if (emailHTML.length > 0 && emailHTML !== prevState.emailHTML.__html) {
      this.drawCanvases();
    }
  }
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
