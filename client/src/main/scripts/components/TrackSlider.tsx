import * as React from "react";
import * as ReactDOM from "react-dom";
import RangeContainer from "./RangeContainer";
import { RangeType, StateAuthority, TimeRange } from "./Video";
import { convertSecondsToTimestamp } from "../utils/functions";

export interface TrackSliderEventHandlers {
  onAfterRangeChange: (
    value: [number, number] | number,
    type: RangeType
  ) => any;
  onRangeChange: (value: [number, number] | number, type: RangeType) => any;
}

interface TrackSliderProps {
  end: number;
  eventHandlers: TrackSliderEventHandlers;
  rangeSliders: TimeRange[];
  start: number;
  stateAuthority: StateAuthority;
  step: number;
}

interface TrackSliderState {
  prettyStart: string;
  prettyEnd: string;
}

class TrackSlider extends React.Component<TrackSliderProps, TrackSliderState> {
  constructor(props: TrackSliderProps) {
    super(props);

    this.state = {
      prettyStart: convertSecondsToTimestamp(props.start),
      prettyEnd: convertSecondsToTimestamp(props.end)
    };
  }
  componentWillReceiveProps(nextProps: TrackSliderProps) {
    if (
      this.props.start !== nextProps.start ||
      this.props.end !== nextProps.end
    ) {
      this.setState({
        prettyStart: convertSecondsToTimestamp(nextProps.start),
        prettyEnd: convertSecondsToTimestamp(nextProps.end)
      });
    }
  }
  render() {
    const { props } = this;

    return (
      <div className="trackSlider">
        <p className="trackSlider__text trackSlider__text--min">
          {this.state.prettyStart}
        </p>
        <div className="trackSlider__range-container">
          {props.rangeSliders.map(rangeSlider => {
            const start =
              rangeSlider.start < props.start ? props.start : rangeSlider.start;
            let defaultValue: number | [number, number];
            let value: number | [number, number];
            if (typeof rangeSlider.end !== "undefined") {
              const end =
                rangeSlider.end > props.end ? props.end : rangeSlider.end;
              defaultValue = [0, props.end];
              value = [start, end];
            } else {
              defaultValue = 0;
              value = start;
            }
            return (
              <RangeContainer
                defaultValue={defaultValue}
                handleStyle={rangeSlider.styles.handle}
                label={rangeSlider.label}
                min={props.start}
                max={props.end}
                eventHandlers={props.eventHandlers}
                railStyle={rangeSlider.styles.rail}
                stateAuthority={props.stateAuthority}
                step={props.step}
                trackStyle={rangeSlider.styles.track}
                type={rangeSlider.type}
                value={value}
                key={rangeSlider.type}
              />
            );
          })}
        </div>
        <p className="trackSlider__text trackSlider__text--max">
          {this.state.prettyEnd}
        </p>
      </div>
    );
  }
}

export default TrackSlider;
