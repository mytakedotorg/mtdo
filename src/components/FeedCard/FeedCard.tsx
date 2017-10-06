import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "../BlockReader";
import { TakeDocument } from "../BlockEditor";
import { getDocumentFactTitle } from "../../utils/databaseAPI";
import { Article } from "../../utils/databaseData";
import { getNodeArray, getHighlightedNodes } from "../../utils/functions";

interface FeedCardProps {
  username: string;
  article: Article;
}

class FeedCard extends React.Component<FeedCardProps, {}> {
  constructor(props: FeedCardProps) {
    super(props);
  }
  getArticleURL = () => {
    return "/" + this.props.username + "/" + this.props.article.titleSlug + "/";
  };
  getTakeDocument = (): TakeDocument => {
    let { article } = this.props;
    return {
      title: article.title,
      blocks: article.blocks
    };
  };
  render() {
    let { props } = this;
    return (
      <div className="feed__card">
        <a href={this.getArticleURL()} className="feed__link">
          <span />
        </a>
        {props.article.previewBlocks.map((blockIdx, mapIdx) => {
          let block = props.article.blocks[blockIdx];
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
                    {getDocumentFactTitle(block.excerptId)}
                  </h2>
                  <div className="feed__card-document-text">
                    {highlightedNodes.map((node, index) => {
                      node.props["key"] = index.toString();
                      return React.createElement(
                        node.component,
                        node.props,
                        node.innerHTML
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          } else if (block.kind === "video") {
            let thumb = "http://img.youtube.com/vi/" + block.videoId + "/0.jpg";
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
          <h2 className="feed__card-title">
            {props.article.title}
          </h2>
          {props.article.previewBlocks.map((blockIdx, mapIdx) => {
            let block = props.article.blocks[blockIdx];
            if (block.kind === "paragraph") {
              return (
                <div className="feed__card-text-container" key={mapIdx}>
                  <p className="feed__card-text">
                    {block.text}
                  </p>
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
