import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline from "../Timeline";
import TimelinePreview, { PreviewDocument } from "../TimelinePreview";
import { FoundationTextType } from "../Foundation";

interface TimelineViewProps {}

interface TimelineViewState {
  previewDocument: PreviewDocument | null;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  constructor(props: TimelineViewProps) {
    super(props);
    this.state = {
      previewDocument: null
    };
  }
  showPreview = (
    range: [number, number],
    type: FoundationTextType,
    title: string
  ) => {
    console.log("HUZZAH!!");
    this.setState({
      previewDocument: {
        range: range,
        type: type,
        title: title
      }
    });
  };
  render() {
    return (
      <div>
        <Timeline onItemClick={this.showPreview} />
        {this.state.previewDocument
          ? <TimelinePreview
              range={this.state.previewDocument.range}
              type={this.state.previewDocument.type}
              title={this.state.previewDocument.title}
            />
          : null}
      </div>
    );
  }
}
