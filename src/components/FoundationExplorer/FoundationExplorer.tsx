import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import database, { EvidenceBlock } from "../../utils/database";
import Foundation, { FoundationTextType } from "../Foundation";

interface FoundationExplorerState {
  articleTitle: string;
  articleUser: string;
  type: FoundationTextType;
  range: [number, number];
}

class FoundationExplorer extends React.Component<{}, FoundationExplorerState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      articleTitle: null,
      articleUser: null,
      type: null,
      range: [0, 0]
    };
  }
  handleBackClick = () => {
    let url = "/" + this.state.articleUser + "/" + this.state.articleTitle;
    window.location.href = url;
  };
  handleSetClick = (
    type: FoundationTextType,
    range: [number, number]
  ): void => {
    window.location.href =
      "/new-take/#" +
      type.toLowerCase() +
      "&" +
      "/" +
      this.state.articleUser +
      "/" +
      this.state.articleTitle +
      "&" +
      range[0] +
      "&" +
      range[1];
  };
  getBlockMetaData = (
    username: string,
    articleTitle: string,
    blockIndex: number
  ): EvidenceBlock => {
    // This function can be stubbed out when a backend/database is needed
    for (let user of database.users) {
      if (user.name === username) {
        for (let article of user.articles) {
          if (article.title === articleTitle) {
            for (let block of article.evidenceBlocks) {
              if (block.index === blockIndex) {
                return block;
              }
            }
          }
        }
      }
    }
  };
  getDocumentInfo = () => {
    if (window.location.hash) {
      // Expect hash URL to be like, #/{user}/{article-title}&{block-index}
      let hashes = window.location.hash.split("&");
      let user = hashes[0].substring(1).split("/")[1];
      let articleTitle = hashes[0].substring(1).split("/")[2];
      let blockIndex = parseInt(hashes[1]);
      let metaData = this.getBlockMetaData(user, articleTitle, blockIndex);
      this.setState({
        articleTitle: articleTitle,
        articleUser: user,
        type: metaData.type,
        range: metaData.range
      });
    }
  };
  componentDidMount() {
    this.getDocumentInfo();
  }
  render() {
    if (!this.state.type) {
      return (
        <div className="DocumentReader">
          <Foundation
            handleDocumentSetClick={this.handleSetClick}
            handleVideoSetClick={this.handleSetClick}
          />
        </div>
      );
    } else {
      return (
        <div className="DocumentReader">
          <Document
            backButtonText={this.state.articleTitle}
            onBackClick={this.handleBackClick}
            onSetClick={this.handleSetClick}
            range={this.state.range}
            type={this.state.type}
          />
        </div>
      );
    }
  }
}

export default FoundationExplorer;
