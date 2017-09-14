import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline from "../Timeline";
import TimelinePreview from "../TimelinePreview";
import { FoundationTextType } from "../Foundation";

interface TimelineViewProps {}

interface TimelineViewState {
  excerptId: string | null;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  constructor(props: TimelineViewProps) {
    super(props);
    this.state = {
      excerptId: null
    };
  }
  showPreview = (excerptId: string) => {
    this.setState({
      excerptId: excerptId
    });
  };
  render() {
    return (
      <div>
        <Timeline onItemClick={this.showPreview} />
        {this.state.excerptId
          ? <TimelinePreview excerptId={this.state.excerptId} />
          : null}
      </div>
    );
  }
}
