import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import { FoundationTextType } from "../Foundation";
import { getExcerpt } from "../../utils/functions";

interface TimelinePreviewProps {
  excerptId: string;
}

interface TimelinePreviewState {}

export default class TimelinePreview extends React.Component<
  TimelinePreviewProps,
  TimelinePreviewState
> {
  constructor(props: TimelinePreviewProps) {
    super(props);
  }
  getTitle = () => {
    return getExcerpt(this.props.excerptId).title;
  };
  handleBackClick = () => {};
  handleSetClick = () => {};
  render() {
    return (
      <div>
        <h3>
          {this.getTitle()}
        </h3>
        <Document
          onBackClick={this.handleBackClick}
          onSetClick={this.handleSetClick}
          excerptId={this.props.excerptId}
        />
      </div>
    );
  }
}
