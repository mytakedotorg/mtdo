import * as React from "react";
import * as ReactDOM from "react-dom";
import Amendments from "../Amendments";
import Constitution from "../Constitution";
import database, { BlockIndexMetaData } from "../../utils/database";
import Foundation, { FoundationTextType } from "../Foundation";

interface FoundationExplorerProps {
  type?: FoundationTextType;
  range?: [number, number];
  offset?: number;
}

interface FoundationExplorerState {
  type: FoundationTextType;
  range: [number, number];
}

class FoundationExplorer extends React.Component<
  FoundationExplorerProps,
  FoundationExplorerState
> {
  constructor(props: FoundationExplorerProps) {
    super(props);

    this.state = {
      type: props ? props.type : null,
      range: props ? props.range : [0, 0]
    };
  }
  handleBackClick = () => {
    // TODO
  };
  handleSetClick = () => {
    // TODO
  };
  getBlockMetaData = (
    user: string,
    article: string,
    blockIndex: number
  ): BlockIndexMetaData => {
    // This function can be stubbed out when a backend/database is needed
    if (database[user]) {
      if (database[user][article]) {
        if (database[user][article][blockIndex]) {
          return database[user][article][blockIndex];
        }
      }
    }
  };
  getDocumentInfo = () => {
    if (window.location.hash) {
      // Expect hash URL to be like, #/{user}/{article-title}&{block-index}
      let hashes = window.location.hash.split("&");
      let user = hashes[0].substring(1).split("/")[0];
      let article = hashes[0].substring(1).split("/")[1];
      let blockIndex = parseInt(hashes[1]);
      let metaData = this.getBlockMetaData(user, article, blockIndex);
      this.setState({
        type: metaData.type,
        range: metaData.range
      });
    }
  };
  componentDidMount() {
    if (!this.props) {
      this.getDocumentInfo();
    }
  }
  render() {
    switch (this.state.type) {
      case "AMENDMENTS":
        return (
          <div className="DocumentReader">
            <Amendments
              onBackClick={this.handleBackClick}
              onSetClick={this.handleSetClick}
              range={this.props.range}
              offset={this.props.offset}
            />
          </div>
        );
      case "CONSTITUTION":
        return (
          <div className="DocumentReader">
            <Constitution
              onBackClick={this.handleBackClick}
              onSetClick={this.handleSetClick}
            />
          </div>
        );
      default:
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
