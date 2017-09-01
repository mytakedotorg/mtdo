import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import database, { EvidenceBlock } from "../../utils/database";
import Foundation, { FoundationTextType } from "../Foundation";

interface FoundationExplorerProps {
  articleTitle: string;
  articleUser: string;
  blockIndex: number;
  range: [number, number];
  scrollTop: number;
  type: FoundationTextType;
}

class FoundationExplorer extends React.Component<FoundationExplorerProps, {}> {
  constructor(props: FoundationExplorerProps) {
    super(props);
  }
  handleBackClick = () => {
    let url = "/" + this.props.articleUser + "/" + this.props.articleTitle;
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
      this.props.articleUser +
      "/" +
      this.props.articleTitle +
      "&" +
      range[0] +
      "&" +
      range[1];
  };
  render() {
    return (
      <div className="DocumentReader">
        <Document
          offset={this.props.scrollTop}
          onBackClick={this.handleBackClick}
          onSetClick={this.handleSetClick}
          range={this.props.range}
          type={this.props.type}
        />
      </div>
    );
  }
}

export default FoundationExplorer;
