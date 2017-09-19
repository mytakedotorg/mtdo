import * as React from "react";
import * as ReactDOM from "react-dom";
import DocumentFullScreen from "../DocumentFullScreen";
import Foundation, { FoundationTextType } from "../Foundation";

interface FoundationExplorerProps {
  articleTitle: string;
  articleUser: string;
  highlightedRange: [number, number];
  scrollTop: number;
  excerptId: string;
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
      range[0] +
      "&" +
      range[1] +
      "&" +
      "/" +
      this.props.articleUser +
      "/" +
      this.props.articleTitle;
  };
  render() {
    return (
      <div className="DocumentReader">
        <DocumentFullScreen
          offset={this.props.scrollTop}
          onBackClick={this.handleBackClick}
          onSetClick={this.handleSetClick}
          highlightedRange={this.props.highlightedRange}
          excerptId={this.props.excerptId}
        />
      </div>
    );
  }
}

export default FoundationExplorer;
