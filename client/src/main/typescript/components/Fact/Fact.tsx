import * as React from "react";
import * as ReactDOM from "react-dom";
import TimelineView from "../TimelineView";
import { routes } from "../../utils/routes";

interface FactProps {
  articleTitle: string;
  articleUser: string;
  highlightedRange: [number, number];
  viewRange: [number, number];
  scrollTop: number;
  excerptId: string;
}

class Fact extends React.Component<FactProps, {}> {
  constructor(props: FactProps) {
    super(props);
  }
  handleDocumentSetClick = (
    excerptTitle: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ): void => {
    window.location.href =
      routes.DRAFTS_NEW +
      "/#" +
      excerptTitle +
      "&" +
      highlightedRange[0] +
      "&" +
      highlightedRange[1] +
      "&" +
      viewRange[0] +
      "&" +
      viewRange[1] +
      "&" +
      "/" +
      this.props.articleUser +
      "/" +
      this.props.articleTitle;
  };
  handleVideoSetClick = (
    excerptTitle: string,
    range: [number, number]
  ): void => {
    window.location.href =
      routes.DRAFTS_NEW +
      "/#" +
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
      viewRange: this.props.viewRange,
      excerptId: this.props.excerptId
    };

    const setFactHandlers = {
      handleDocumentSetClick: this.handleDocumentSetClick,
      handleVideoSetClick: this.handleVideoSetClick
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

export default Fact;
