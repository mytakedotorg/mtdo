import * as React from "react";
import * as ReactDOM from "react-dom";
import TimelineView from "../TimelineView";

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
  handleSetClick = (excerptTitle: string, range: [number, number]): void => {
    window.location.href =
      "/new-take/#" +
      excerptTitle +
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
    const initialRange = {
      offset: this.props.scrollTop,
      highlightedRange: this.props.highlightedRange,
      excerptId: this.props.excerptId
    };

    const setFactHandlers = {
      handleDocumentSetClick: this.handleSetClick,
      handleVideoSetClick: this.handleSetClick
    };

    return (
      <div className="DocumentReader">
        <TimelineView
          initialRange={initialRange}
          setFactHandlers={setFactHandlers}
        />
      </div>
    );
  }
}

export default FoundationExplorer;
