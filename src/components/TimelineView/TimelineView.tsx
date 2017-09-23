import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline from "../Timeline";
import TimelinePreview, { SetFactHandlers } from "../TimelinePreview";
import { FoundationTextType } from "../Foundation";

interface InitialRangeOptions {
  offset: number;
  highlightedRange: [number, number];
  excerptId: string;
}

interface TimelineViewProps {
  setFactHandlers?: SetFactHandlers;
  initialRange?: InitialRangeOptions;
}

interface TimelineViewState {
  excerptId: string;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  constructor(props: TimelineViewProps) {
    super(props);
    this.state = {
      excerptId: props.initialRange ? props.initialRange.excerptId : ""
    };
  }
  showPreview = (excerptId: string) => {
    this.setState({
      excerptId: excerptId
    });
  };
  render() {
    if (this.props.initialRange) {
      return (
        <div className={"timeline__view"}>
          <TimelinePreview
            excerptId={this.state.excerptId}
            setFactHandlers={this.props.setFactHandlers}
            highlightedRange={this.props.initialRange.highlightedRange}
            offset={this.props.initialRange.offset}
          />
          <Timeline onItemClick={this.showPreview} />
        </div>
      );
    } else {
      return (
        <div className={"timeline__view"}>
          <Timeline onItemClick={this.showPreview} />
          {this.state.excerptId
            ? <TimelinePreview
                excerptId={this.state.excerptId}
                setFactHandlers={this.props.setFactHandlers}
              />
            : null}
        </div>
      );
    }
  }
}
