import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline from "../Timeline";
import TimelinePreview, { SetFactHandlers } from "../TimelinePreview";

interface InitialRangeOptions {
  offset: number;
  highlightedRange: [number, number];
  viewRange: [number, number];
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
    const { props } = this;
    if (props.initialRange) {
      const ranges = {
        highlightedRange: props.initialRange.highlightedRange,
        viewRange: props.initialRange.viewRange
      };
      return (
        <div className={"timeline__view"}>
          <TimelinePreview
            excerptId={this.state.excerptId}
            setFactHandlers={props.setFactHandlers}
            ranges={ranges}
            offset={props.initialRange.offset}
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
                setFactHandlers={props.setFactHandlers}
              />
            : null}
        </div>
      );
    }
  }
}
