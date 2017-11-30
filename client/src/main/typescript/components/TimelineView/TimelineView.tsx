import * as React from "react";
import * as ReactDOM from "react-dom";
import TimelineContainer from "../TimelineContainer";
import TimelinePreviewContainer from "../TimelinePreviewContainer";
import { SetFactHandlers } from "../TimelinePreview";
import { Foundation } from "../../java2ts/Foundation";

interface InitialRangeOptions {
  offset: number;
  highlightedRange: [number, number];
  viewRange: [number, number];
  factLink: Foundation.FactLink;
}

interface TimelineViewProps {
  setFactHandlers?: SetFactHandlers;
  initialRange?: InitialRangeOptions;
}

interface TimelineViewState {
  factLink: Foundation.FactLink | null;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  constructor(props: TimelineViewProps) {
    super(props);
    this.state = {
      factLink: props.initialRange ? props.initialRange.factLink : null
    };
  }
  showPreview = (factLink: Foundation.FactLink) => {
    this.setState({
      factLink: factLink
    });
  };
  render() {
    const { props } = this;
    if (props.initialRange && this.state.factLink) {
      const ranges = {
        highlightedRange: props.initialRange.highlightedRange,
        viewRange: props.initialRange.viewRange
      };
      return (
        <div className={"timeline__view"}>
          <TimelinePreviewContainer
            factLink={this.state.factLink}
            setFactHandlers={props.setFactHandlers}
            ranges={ranges}
            offset={props.initialRange.offset}
          />
          <div className="editor__wrapper">
            <p className="timeline__instructions">
              Explore other Facts in the timeline below.
            </p>
          </div>
          <TimelineContainer onItemClick={this.showPreview} />
        </div>
      );
    } else {
      return (
        <div className={"timeline__view"}>
          <TimelineContainer onItemClick={this.showPreview} />
          {this.state.factLink
            ? <TimelinePreviewContainer
                factLink={this.state.factLink}
                setFactHandlers={props.setFactHandlers}
              />
            : null}
        </div>
      );
    }
  }
}
