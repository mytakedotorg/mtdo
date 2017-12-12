import * as React from "react";
import * as ReactDOM from "react-dom";
import DocumentTextNodeList from "./DocumentTextNodeList";
import { Card } from "./FeedList";
import { getNodeArray, getHighlightedNodes } from "../utils/functions";

class FeedCard extends React.Component<Card, {}> {
  constructor(props: Card) {
    super(props);
  }
  render() {
    let { props } = this;
    return (
      <div className="feed__card">
        <a
          href={"/" + this.props.username + "/" + this.props.titleSlug}
          className="feed__link"
        >
          <span />
        </a>
        {props.previewBlocks.map((blockIdx, mapIdx) => {
          let block = props.blocks[blockIdx];
          if (block.kind === "document") {
            let highlightedNodes = getHighlightedNodes(
              getNodeArray(block.excerptId),
              block.highlightedRange,
              block.viewRange
            );
            return (
              <div
                className="feed__card-thumb-container feed__card-thumb-container--document"
                key={mapIdx}
              >
                <div className="feed__card-document">
                  <h2 className="feed__card-document-title">
                    {this.props.title}
                  </h2>
                  <DocumentTextNodeList
                    className="feed__card-document-text"
                    documentNodes={highlightedNodes}
                  />
                </div>
              </div>
            );
          } else if (block.kind === "video") {
            let thumb =
              "https://img.youtube.com/vi/" + block.videoId + "/0.jpg";
            return (
              <div
                className="feed__card-thumb-container feed__card-thumb-container--video"
                key={mapIdx}
              >
                <img className="feed__card-thumb" src={thumb} />
              </div>
            );
          }
        })}
        <div className="feed__card-excerpt">
          <h2 className="feed__card-title">{props.title}</h2>
          {props.previewBlocks.map((blockIdx, mapIdx) => {
            let block = props.blocks[blockIdx];
            if (block.kind === "paragraph") {
              return (
                <div className="feed__card-text-container" key={mapIdx}>
                  <p className="feed__card-text">{block.text}</p>
                </div>
              );
            }
          })}
        </div>
        <span className="feed__more">Read more</span>
      </div>
    );
  }
}

export default FeedCard;
