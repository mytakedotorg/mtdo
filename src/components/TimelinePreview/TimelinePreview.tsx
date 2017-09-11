import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import { FoundationTextType } from "../Foundation";

export interface PreviewDocument {
  range: [number, number];
  type: FoundationTextType;
  title: string;
}

interface TimelinePreviewProps {
  range: [number, number];
  type: FoundationTextType;
  title: string;
}

interface TimelinePreviewState {}

export default class TimelinePreview extends React.Component<
  TimelinePreviewProps,
  TimelinePreviewState
> {
  constructor(props: TimelinePreviewProps) {
    super(props);
  }
  handleBackClick = () => {};
  handleSetClick = () => {};
  render() {
    return (
      <div>
        <h3>this.props.title</h3>
        <Document
          onBackClick={this.handleBackClick}
          onSetClick={this.handleSetClick}
          range={this.props.range}
          type={this.props.type}
        />
      </div>
    );
  }
}
