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
  offset: number;
}

class FoundationExplorer extends React.Component<{}, FoundationExplorerState | undefined> {
  constructor(props: {}) {
		super(props);
		// this.state = {

		// };
  }
  handleBackClick = () => {
		if (this.state) {
			let url = "/" + this.state.articleUser + "/" + this.state.articleTitle;
			window.location.href = url;
		}
  };
  handleSetClick = (
    type: FoundationTextType,
    range: [number, number]
  ): void => {
		if (this.state) {
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
		}
  };
  getBlockMetaData = (
    username: string,
    articleTitle: string,
    blockIndex: number
  ): EvidenceBlock | undefined => {
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
      // Expect hash URL to be like, #/{user}/{article-title}&{block-index}&{scrollTop}
      let hashes = window.location.hash.split("&");
      let user = hashes[0].substring(1).split("/")[1];
      let articleTitle = hashes[0].substring(1).split("/")[2];
      let blockIndex = parseInt(hashes[1]);
			let offset = parseInt(hashes[2]);
			this.setState({
        articleTitle: articleTitle,
        articleUser: user,
        offset: offset
			});
			
			let metaData = this.getBlockMetaData(user, articleTitle, blockIndex);
			
			if (metaData) {
				this.setState({
					type: metaData.type,
					range: metaData.range
				});
			}
    }
  };
  componentDidMount() {
    this.getDocumentInfo();
  }
  render() {
		if (this.state) {
			return (
        <div className="DocumentReader">
          <Document
            backButtonText={this.state.articleTitle}
            offset={this.state.offset}
            onBackClick={this.handleBackClick}
            onSetClick={this.handleSetClick}
            range={this.state.range}
            type={this.state.type}
          />
        </div>
      );
		} else {
      return (
        <div className="DocumentReader">
          <Foundation
            handleDocumentSetClick={this.handleSetClick}
            handleVideoSetClick={this.handleSetClick}
          />
        </div>
      );
    }
  }
}

export default FoundationExplorer;
